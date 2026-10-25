import {
  PutObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import { s3Client, storageConfig } from './s3Client';

export interface PresignedUploadResult {
  uploadUrl: string;
  s3Key: string;
  bucket: string;
  expiresInSeconds: number;
  requiredHeaders: Record<string, string>;
}

export class StorageService {
  private bucket: string;

  constructor() {
    this.bucket = storageConfig.bucket;
  }

  /**
   * Generates an encrypted presigned upload URL with strict Content-Type and SSE-S3 headers
   */
  async generateUploadPresignedUrl(params: {
    applicationId: string;
    category: string;
    fileName: string;
    mimeType: string;
    expiresInSeconds?: number;
  }): Promise<PresignedUploadResult> {
    const { applicationId, category, fileName, mimeType, expiresInSeconds = 900 } = params;

    // Sanitize filename & create unique immutable S3 key path
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const categorySlug = category.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    const uniqueId = crypto.randomBytes(8).toString('hex');
    const s3Key = `applications/${applicationId}/${categorySlug}/${Date.now()}-${uniqueId}-${sanitizedFileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: s3Key,
      ContentType: mimeType,
      ServerSideEncryption: storageConfig.serverSideEncryption,
      SSEKMSKeyId: storageConfig.kmsKeyId,
      Metadata: {
        'x-application-id': applicationId,
        'x-document-category': category,
        'x-uploaded-at': new Date().toISOString(),
      },
    });

    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: expiresInSeconds,
    });

    const requiredHeaders: Record<string, string> = {
      'Content-Type': mimeType,
      'x-amz-server-side-encryption': storageConfig.serverSideEncryption,
    };

    if (storageConfig.kmsKeyId) {
      requiredHeaders['x-amz-server-side-encryption-aws-kms-key-id'] = storageConfig.kmsKeyId;
    }

    return {
      uploadUrl,
      s3Key,
      bucket: this.bucket,
      expiresInSeconds,
      requiredHeaders,
    };
  }

  /**
   * Generates a secure, temporary presigned download URL
   */
  async generateDownloadPresignedUrl(
    s3Key: string,
    expiresInSeconds = 3600,
    downloadFileName?: string
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: s3Key,
      ResponseContentDisposition: downloadFileName
        ? `attachment; filename="${downloadFileName}"`
        : 'inline',
    });

    return getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
  }

  /**
   * Direct server-side upload of raw Buffer with SSE-S3 AES256 encryption
   */
  async uploadBuffer(params: {
    s3Key: string;
    buffer: Buffer;
    mimeType: string;
    metadata?: Record<string, string>;
  }): Promise<{ s3Key: string; checksum: string }> {
    const { s3Key, buffer, mimeType, metadata } = params;
    const checksum = this.computeSha256(buffer);

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: s3Key,
      Body: buffer,
      ContentType: mimeType,
      ServerSideEncryption: storageConfig.serverSideEncryption,
      SSEKMSKeyId: storageConfig.kmsKeyId,
      Metadata: {
        ...metadata,
        'sha256-checksum': checksum,
      },
    });

    await s3Client.send(command);
    return { s3Key, checksum };
  }

  /**
   * Delete an object from storage
   */
  async deleteFile(s3Key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: s3Key,
    });
    await s3Client.send(command);
  }

  /**
   * Cryptographic SHA-256 Checksum calculation
   */
  computeSha256(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Probe S3/MinIO bucket connectivity
   */
  async checkStorageHealth(): Promise<{ healthy: boolean; error?: string }> {
    try {
      const command = new HeadBucketCommand({ Bucket: this.bucket });
      await s3Client.send(command);
      return { healthy: true };
    } catch (err: any) {
      // In local environments where MinIO/S3 is optional or mock-backed, report status
      return { healthy: false, error: err.message };
    }
  }
}

export const storageService = new StorageService();
