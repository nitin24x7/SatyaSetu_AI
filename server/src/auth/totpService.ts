import crypto from 'crypto';

export class TotpService {
  private base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

  /**
   * Generates a random Base32 TOTP secret key (160-bit)
   */
  generateSecret(length = 32): string {
    const bytes = crypto.randomBytes(length);
    let secret = '';
    for (let i = 0; i < length; i++) {
      secret += this.base32Chars[bytes[i] % this.base32Chars.length];
    }
    return secret;
  }

  /**
   * Base32 decoder into Buffer
   */
  private decodeBase32(str: string): Buffer {
    const cleanStr = str.toUpperCase().replace(/=+$/, '').replace(/\s+/g, '');
    let bits = 0;
    let value = 0;
    const output: number[] = [];

    for (let i = 0; i < cleanStr.length; i++) {
      const idx = this.base32Chars.indexOf(cleanStr[i]);
      if (idx === -1) continue;

      value = (value << 5) | idx;
      bits += 5;

      if (bits >= 8) {
        output.push((value >>> (bits - 8)) & 255);
        bits -= 8;
      }
    }

    return Buffer.from(output);
  }

  /**
   * Generates a 6-digit TOTP code for a given timestamp counter (RFC 6238)
   */
  generateCode(secret: string, timestampMs = Date.now()): string {
    const key = this.decodeBase32(secret);
    const counter = Math.floor(timestampMs / 1000 / 30);

    const counterBuffer = Buffer.alloc(8);
    counterBuffer.writeBigUInt64BE(BigInt(counter));

    const hmac = crypto.createHmac('sha1', key).update(counterBuffer).digest();

    // Dynamic truncation
    const offset = hmac[hmac.length - 1] & 0x0f;
    const codeInt =
      ((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff);

    const token = (codeInt % 1_000_000).toString().padStart(6, '0');
    return token;
  }

  /**
   * Verifies a 6-digit TOTP token against a secret with time drift tolerance
   */
  verifyCode(secret: string, code: string, windowSteps = 1): boolean {
    const cleanCode = (code || '').trim();
    if (cleanCode.length !== 6) return false;

    const now = Date.now();
    for (let step = -windowSteps; step <= windowSteps; step++) {
      const generated = this.generateCode(secret, now + step * 30_000);
      if (crypto.timingSafeEqual(Buffer.from(cleanCode), Buffer.from(generated))) {
        return true;
      }
    }

    return false;
  }

  /**
   * Generates standard otpauth URI for mobile authenticator apps
   */
  generateOtpAuthUri(accountEmail: string, secret: string, issuer = 'SatyaSetu AI'): string {
    const encodedIssuer = encodeURIComponent(issuer);
    const encodedAccount = encodeURIComponent(accountEmail);
    return `otpauth://totp/${encodedIssuer}:${encodedAccount}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
  }

  /**
   * Generates emergency one-time backup recovery codes
   */
  generateBackupCodes(count = 8): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const hex = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(`${hex.substring(0, 4)}-${hex.substring(4, 8)}`);
    }
    return codes;
  }
}

export const totpService = new TotpService();

