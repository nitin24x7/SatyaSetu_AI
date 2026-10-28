/**
 * SatyaSetu AI - DPDP Act 2023 Privacy & PII Sanitization Engine
 * Phase 10: Security Auditing (Cert-In), Load Testing, Disaster Recovery & Staging Runbooks
 */

import crypto from 'crypto';
import { DpdpRedactionResult } from './types';

export class DpdpPrivacyEngine {
  private static instance: DpdpPrivacyEngine;

  public static getInstance(): DpdpPrivacyEngine {
    if (!DpdpPrivacyEngine.instance) {
      DpdpPrivacyEngine.instance = new DpdpPrivacyEngine();
    }
    return DpdpPrivacyEngine.instance;
  }

  /**
   * Scans and sanitizes sensitive Personally Identifiable Information (PII) from strings or documents
   * in strict compliance with the Digital Personal Data Protection Act (DPDP Act) 2023.
   */
  public redactPii(inputText: string): DpdpRedactionResult {
    let redacted = inputText;
    const detectedEntities: DpdpRedactionResult['detectedPiiEntities'] = [];

    // 1. Aadhaar Number Pattern: 12 digits, often formatted as 4-4-4
    // Mask to XXXX-XXXX-1234
    const aadhaarRegex = /\b([2-9]\d{3})[ -]?(\d{4})[ -]?(\d{4})\b/g;
    let match: RegExpExecArray | null;

    while ((match = aadhaarRegex.exec(inputText)) !== null) {
      const fullMatch = match[0];
      const last4 = match[3];
      const masked = `XXXX-XXXX-${last4}`;
      detectedEntities.push({
        type: 'AADHAAR',
        originalMasked: `****-****-${last4}`,
        startIndex: match.index,
        endIndex: match.index + fullMatch.length,
        lawfulBasis: 'DPDP Act 2023 Section 8 (Data Minimization in Statutory Scrutiny)',
      });
    }
    redacted = redacted.replace(aadhaarRegex, 'XXXX-XXXX-$3');

    // 2. Permanent Account Number (PAN): 5 letters + 4 digits + 1 letter
    // Mask to ABCDE****F
    const panRegex = /\b([A-Z]{5})(\d{4})([A-Z])\b/g;
    while ((match = panRegex.exec(inputText)) !== null) {
      const fullMatch = match[0];
      const prefix = match[1];
      const suffix = match[3];
      const masked = `${prefix}****${suffix}`;
      detectedEntities.push({
        type: 'PAN',
        originalMasked: `${prefix}****${suffix}`,
        startIndex: match.index,
        endIndex: match.index + fullMatch.length,
        lawfulBasis: 'Income Tax Act & DPDP Act statutory masking requirement',
      });
    }
    redacted = redacted.replace(panRegex, '$1****$3');

    // 3. Indian Phone Numbers: +91 or standard 10-digit mobile starting with 6, 7, 8, or 9
    const phoneRegex = /(?:\+91|91|0)?[ -]?([6-9]\d{4})[ -]?(\d{5})\b/g;
    while ((match = phoneRegex.exec(inputText)) !== null) {
      const fullMatch = match[0];
      const suffix = match[2];
      detectedEntities.push({
        type: 'PHONE',
        originalMasked: `+91-XXXXX-${suffix}`,
        startIndex: match.index,
        endIndex: match.index + fullMatch.length,
        lawfulBasis: 'DPDP Act 2023 Section 6 (Consent & Contact Privacy)',
      });
    }
    redacted = redacted.replace(phoneRegex, '+91-XXXXX-$2');

    // 4. Institutional/Personal Email Addresses
    const emailRegex = /\b([a-zA-Z0-9_.+-])[a-zA-Z0-9_.+-]*@([a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)\b/g;
    while ((match = emailRegex.exec(inputText)) !== null) {
      const fullMatch = match[0];
      const initialChar = match[1];
      const domain = match[2];
      detectedEntities.push({
        type: 'EMAIL',
        originalMasked: `${initialChar}****@${domain}`,
        startIndex: match.index,
        endIndex: match.index + fullMatch.length,
        lawfulBasis: 'DPDP Act 2023 Section 7 (Legitimate Use for Institutional Notice)',
      });
    }
    redacted = redacted.replace(emailRegex, '$1****@$2');

    const timestamp = new Date().toISOString();
    const tamperProofHash = crypto
      .createHash('sha256')
      .update(inputText + redacted + timestamp)
      .digest('hex');

    return {
      originalLength: inputText.length,
      redactedLength: redacted.length,
      redactedText: redacted,
      detectedPiiEntities: detectedEntities,
      complianceAttestation: {
        act: 'Digital Personal Data Protection Act (DPDP Act) 2023',
        section: 'Section 6 (Consent), Section 8 (General Obligations of Data Fiduciary)',
        tamperProofHash,
        timestamp,
      },
    };
  }

  /**
   * Sanitizes structured application JSON payload recursively
   */
  public redactApplicationObject(data: any): any {
    if (typeof data === 'string') {
      return this.redactPii(data).redactedText;
    }
    if (Array.isArray(data)) {
      return data.map(item => this.redactApplicationObject(item));
    }
    if (data !== null && typeof data === 'object') {
      const sanitized: Record<string, any> = {};
      for (const [key, value] of Object.entries(data)) {
        // Redact key values
        sanitized[key] = this.redactApplicationObject(value);
      }
      return sanitized;
    }
    return data;
  }
}

export const dpdpPrivacyEngine = DpdpPrivacyEngine.getInstance();

