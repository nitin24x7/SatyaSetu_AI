import { S3Client, S3ClientConfig } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

export interface StorageConfig {
  bucket: string;
  region: string;
  endpoint?: string;
  forcePathStyle: boolean;
  accessKeyId: string;
  secretAccessKey: string;
  serverSideEncryption: 'AES256' | 'aws:kms';
  kmsKeyId?: string;
}

export const storageConfig: StorageConfig = {
  bucket: process.env.S3_BUCKET_NAME || 'satyasetu-statutory-documents',
  region: process.env.AWS_REGION || 'ap-south-1',
  endpoint: process.env.S3_ENDPOINT || process.env.MINIO_ENDPOINT || undefined,
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true' || Boolean(process.env.MINIO_ENDPOINT),
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'minioadmin',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'minioadmin',
  serverSideEncryption: (process.env.S3_ENCRYPTION as 'AES256' | 'aws:kms') || 'AES256',
  kmsKeyId: process.env.S3_KMS_KEY_ID || undefined,
};

const clientConfig: S3ClientConfig = {
  region: storageConfig.region,
  endpoint: storageConfig.endpoint,
  forcePathStyle: storageConfig.forcePathStyle,
  credentials: {
    accessKeyId: storageConfig.accessKeyId,
    secretAccessKey: storageConfig.secretAccessKey,
  },
};

export const s3Client = new S3Client(clientConfig);
