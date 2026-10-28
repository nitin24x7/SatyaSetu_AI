/**
 * SatyaSetu AI — Phase 9: Cryptographic Audit Ledger Engine
 * Append-Only Hash-Chained Event Store with Merkle Root Notarization & Tamper Verification
 */

import crypto from 'crypto';
import { AuditBlock, AuditActionType, LedgerVerificationResult } from './types';

export class CryptographicLedger {
  private chain: AuditBlock[] = [];
  private readonly platformSecret: string = process.env.PLATFORM_SIGNING_KEY || 'SATYASETU-NATIONAL-AUTHORITY-ROOT-KEY-2026';
  private readonly genesisPrevHash: string = '0000000000000000000000000000000000000000000000000000000000000000';

  constructor() {
    this.initializeGenesisAndSeedChain();
  }

  private initializeGenesisAndSeedChain(): void {
    // 1. Genesis Block (Seq 0)
    const genesisTime = new Date('2026-01-01T00:00:00.000Z').toISOString();
    const genesisPayload = {
      authority: 'Ministry of Education & Statutory Accreditation Directorate',
      event: 'GENESIS_NOTARIZATION',
      statute: 'SatyaSetu National Higher Education Regulatory Ledger Initialization',
    };
    const genesisPayloadHash = this.computeSha256(JSON.stringify(genesisPayload, Object.keys(genesisPayload).sort()));
    const genesisBlockHash = this.computeBlockHash(0, genesisTime, 'SUBMISSION', genesisPayloadHash, this.genesisPrevHash);
    const genesisSignature = this.signHash(genesisBlockHash);

    const genesisBlock: AuditBlock = {
      sequenceNumber: 0,
      blockId: 'BLK-000000-GENESIS',
      timestamp: genesisTime,
      applicationId: 'SAT-ROOT-SYSTEM',
      actorId: 'AUTHORITY-SYSTEM',
      actorName: 'National Directorate Root Authority',
      actorRole: 'System',
      actionType: 'SUBMISSION',
      actionDescription: 'Platform cryptographic audit ledger genesis block initialized.',
      payload: genesisPayload,
      payloadHash: genesisPayloadHash,
      previousBlockHash: this.genesisPrevHash,
      blockHash: genesisBlockHash,
      digitalSignature: genesisSignature,
    };
    this.chain.push(genesisBlock);

    // 2. Seed Historical Event Blocks
    this.appendBlock({
      applicationId: 'PRM-2026-1001',
      institutionId: 'INST-001',
      actorId: 'INST-001',
      actorName: 'Dr. Suresh Kumar Nayak',
      actorRole: 'Applicant',
      actionType: 'SUBMISSION',
      actionDescription: 'Statutory application submission for National Institute of Technology Karnataka (Surathkal).',
      payload: {
        applicationId: 'PRM-2026-1001',
        academicYear: '2026-2027',
        institutionType: 'Autonomous Engineering College',
        documentsCount: 4,
      },
      timestamp: '2026-03-01T09:30:00.000Z',
    });

    this.appendBlock({
      applicationId: 'PRM-2026-1001',
      institutionId: 'INST-001',
      actorId: 'REV-001',
      actorName: 'Dr. Amitabh Sengupta',
      actorRole: 'TechnicalAssessor',
      actionType: 'VERIFICATION_STARTED',
      actionDescription: 'Technical verification audit commenced by lead assessor.',
      payload: {
        reviewerId: 'REV-001',
        triageScore: 92,
        assignedRole: 'TechnicalAssessor',
      },
      timestamp: '2026-03-02T11:15:00.000Z',
    });

    this.appendBlock({
      applicationId: 'PRM-2026-1001',
      institutionId: 'INST-001',
      actorId: 'REV-001',
      actorName: 'Dr. Amitabh Sengupta',
      actorRole: 'TechnicalAssessor',
      actionType: 'APPROVAL_RECORDED',
      actionDescription: 'Compliance verification verified. Cadre SFR 1:14.8 and carpet area 58,500 sq.m verified.',
      payload: {
        decision: 'Verified',
        complianceScore: 95,
        sfrCompliant: true,
        infraCompliant: true,
      },
      timestamp: '2026-03-03T16:45:00.000Z',
    });
  }

  /**
   * Append a new audit event to the immutable hash chain.
   */
  appendBlock(params: {
    applicationId: string;
    institutionId?: string;
    actorId: string;
    actorName: string;
    actorRole: string;
    actionType: AuditActionType;
    actionDescription: string;
    payload: Record<string, any>;
    timestamp?: string;
  }): AuditBlock {
    const sequenceNumber = this.chain.length;
    const blockId = `BLK-${String(sequenceNumber).padStart(6, '0')}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const timestamp = params.timestamp || new Date().toISOString();
    const previousBlock = this.chain[this.chain.length - 1];
    const previousBlockHash = previousBlock ? previousBlock.blockHash : this.genesisPrevHash;

    const payloadCanonicalJson = JSON.stringify(params.payload, Object.keys(params.payload).sort());
    const payloadHash = this.computeSha256(payloadCanonicalJson);
    const blockHash = this.computeBlockHash(
      sequenceNumber,
      timestamp,
      params.actionType,
      payloadHash,
      previousBlockHash
    );
    const digitalSignature = this.signHash(blockHash);

    const block: AuditBlock = {
      sequenceNumber,
      blockId,
      timestamp,
      applicationId: params.applicationId,
      institutionId: params.institutionId,
      actorId: params.actorId,
      actorName: params.actorName,
      actorRole: params.actorRole,
      actionType: params.actionType,
      actionDescription: params.actionDescription,
      payload: params.payload,
      payloadHash,
      previousBlockHash,
      blockHash,
      digitalSignature,
    };

    this.chain.push(block);
    return block;
  }

  /**
   * Calculate binary Merkle tree root across all blocks in the ledger.
   */
  getMerkleRoot(): string {
    if (this.chain.length === 0) return this.genesisPrevHash;
    const hashes = this.chain.map((b) => b.blockHash);
    return this.computeMerkleRoot(hashes);
  }

  private computeMerkleRoot(hashes: string[]): string {
    if (hashes.length === 0) return this.genesisPrevHash;
    if (hashes.length === 1) return hashes[0];

    const nextLevel: string[] = [];
    for (let i = 0; i < hashes.length; i += 2) {
      const left = hashes[i];
      const right = i + 1 < hashes.length ? hashes[i + 1] : left;
      const combined = this.computeSha256(left + right);
      nextLevel.push(combined);
    }

    return this.computeMerkleRoot(nextLevel);
  }

  /**
   * Verify the entire cryptographic hash chain from Genesis to Head.
   */
  verifyChainIntegrity(): LedgerVerificationResult {
    let verifiedCount = 0;

    for (let i = 0; i < this.chain.length; i++) {
      const block = this.chain[i];

      // 1. Verify sequence order
      if (block.sequenceNumber !== i) {
        return {
          isValid: false,
          totalBlocks: this.chain.length,
          verifiedBlocks: verifiedCount,
          genesisHash: this.chain[0]?.blockHash || '',
          headHash: this.chain[this.chain.length - 1]?.blockHash || '',
          merkleRoot: '',
          tamperedBlockIndex: i,
          tamperedDetails: `Sequence number mismatch at index ${i}: expected ${i}, found ${block.sequenceNumber}`,
          verifiedAt: new Date().toISOString(),
        };
      }

      // 2. Verify previousBlockHash link
      const expectedPrevHash = i === 0 ? this.genesisPrevHash : this.chain[i - 1].blockHash;
      if (block.previousBlockHash !== expectedPrevHash) {
        return {
          isValid: false,
          totalBlocks: this.chain.length,
          verifiedBlocks: verifiedCount,
          genesisHash: this.chain[0]?.blockHash || '',
          headHash: this.chain[this.chain.length - 1]?.blockHash || '',
          merkleRoot: '',
          tamperedBlockIndex: i,
          tamperedDetails: `Broken hash link at block ${i}: previousBlockHash does not match preceding block hash.`,
          verifiedAt: new Date().toISOString(),
        };
      }

      // 3. Verify payloadHash recalculation
      const payloadCanonicalJson = JSON.stringify(block.payload, Object.keys(block.payload).sort());
      const recalculatedPayloadHash = this.computeSha256(payloadCanonicalJson);
      if (block.payloadHash !== recalculatedPayloadHash) {
        return {
          isValid: false,
          totalBlocks: this.chain.length,
          verifiedBlocks: verifiedCount,
          genesisHash: this.chain[0]?.blockHash || '',
          headHash: this.chain[this.chain.length - 1]?.blockHash || '',
          merkleRoot: '',
          tamperedBlockIndex: i,
          tamperedDetails: `Payload digest mismatch in block ${i}: content has been modified after notarization.`,
          verifiedAt: new Date().toISOString(),
        };
      }

      // 4. Verify blockHash recalculation
      const expectedBlockHash = this.computeBlockHash(
        block.sequenceNumber,
        block.timestamp,
        block.actionType,
        block.payloadHash,
        block.previousBlockHash
      );
      if (block.blockHash !== expectedBlockHash) {
        return {
          isValid: false,
          totalBlocks: this.chain.length,
          verifiedBlocks: verifiedCount,
          genesisHash: this.chain[0]?.blockHash || '',
          headHash: this.chain[this.chain.length - 1]?.blockHash || '',
          merkleRoot: '',
          tamperedBlockIndex: i,
          tamperedDetails: `Cryptographic hash corruption in block ${i}: calculated hash differs from stored blockHash.`,
          verifiedAt: new Date().toISOString(),
        };
      }

      // 5. Verify platform signature
      const expectedSignature = this.signHash(block.blockHash);
      if (block.digitalSignature !== expectedSignature) {
        return {
          isValid: false,
          totalBlocks: this.chain.length,
          verifiedBlocks: verifiedCount,
          genesisHash: this.chain[0]?.blockHash || '',
          headHash: this.chain[this.chain.length - 1]?.blockHash || '',
          merkleRoot: '',
          tamperedBlockIndex: i,
          tamperedDetails: `Invalid digital signature on block ${i}: platform signature verification failed.`,
          verifiedAt: new Date().toISOString(),
        };
      }

      verifiedCount++;
    }

    const merkleRoot = this.getMerkleRoot();

    return {
      isValid: true,
      totalBlocks: this.chain.length,
      verifiedBlocks: verifiedCount,
      genesisHash: this.chain[0]?.blockHash || '',
      headHash: this.chain[this.chain.length - 1]?.blockHash || '',
      merkleRoot,
      verifiedAt: new Date().toISOString(),
    };
  }

  /**
   * Retrieve ledger blocks with optional pagination and filtering.
   */
  getBlocks(params?: {
    page?: number;
    limit?: number;
    applicationId?: string;
    actionType?: AuditActionType;
  }): { blocks: AuditBlock[]; total: number; page: number; limit: number; totalPages: number } {
    const page = params?.page || 1;
    const limit = params?.limit || 20;

    let filtered = [...this.chain];
    if (params?.applicationId) {
      filtered = filtered.filter((b) => b.applicationId === params.applicationId);
    }
    if (params?.actionType) {
      filtered = filtered.filter((b) => b.actionType === params.actionType);
    }

    // Newest blocks first
    filtered.sort((a, b) => b.sequenceNumber - a.sequenceNumber);

    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return {
      blocks: paginated,
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit),
    };
  }

  /**
   * Internal helper to compute standard SHA-256 digest.
   */
  private computeSha256(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Internal helper to compute combined block hash.
   */
  private computeBlockHash(
    seq: number,
    time: string,
    action: string,
    payloadHash: string,
    prevHash: string
  ): string {
    const data = `${seq}|${time}|${action}|${payloadHash}|${prevHash}`;
    return this.computeSha256(data);
  }

  /**
   * Internal helper to sign a hash using platform HMAC regulatory secret.
   */
  private signHash(hash: string): string {
    return crypto.createHmac('sha256', this.platformSecret).update(hash).digest('hex');
  }

  /**
   * Diagnostic simulation: simulate retroactive tampering on a block to test tamper-detection.
   */
  simulateTampering(blockIndex: number, alteredField: string, alteredValue: any): void {
    if (blockIndex >= 0 && blockIndex < this.chain.length) {
      (this.chain[blockIndex] as any).payload = {
        ...this.chain[blockIndex].payload,
        [alteredField]: alteredValue,
      };
      // Intentionally do not update blockHash to test tamper-detection
    }
  }

  /**
   * Restore clean chain (for test teardowns).
   */
  restoreCleanChain(): void {
    this.chain = [];
    this.initializeGenesisAndSeedChain();
  }
}

export const cryptographicLedger = new CryptographicLedger();
