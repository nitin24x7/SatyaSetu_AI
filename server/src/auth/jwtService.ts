import crypto from 'crypto';
import { CacheService } from '../cache/cacheService';
import { JwtPayload } from './types';

export class JwtService {
  private secret: string;
  private issuer: string;
  private accessTokenTtlSeconds: number;
  private refreshTokenTtlSeconds: number;
  private cache: CacheService;

  constructor(cacheService?: CacheService) {
    this.secret = process.env.JWT_SECRET || 'satyasetu_pki_hmac_secret_key_2026_enterprise_grade_secure_salt';
    this.issuer = 'https://auth.satyasetu.gov.in';
    this.accessTokenTtlSeconds = 900; // 15 minutes
    this.refreshTokenTtlSeconds = 604800; // 7 days
    this.cache = cacheService || new CacheService();
  }

  private base64UrlEncode(str: string): string {
    return Buffer.from(str)
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }

  private base64UrlDecode(str: string): string {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    return Buffer.from(base64, 'base64').toString('utf8');
  }

  /**
   * Generates a signed JWT access token (HS256)
   */
  signAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp' | 'iss'>): string {
    const now = Math.floor(Date.now() / 1000);
    const fullPayload: JwtPayload = {
      ...payload,
      iat: now,
      exp: now + this.accessTokenTtlSeconds,
      iss: this.issuer,
    };

    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };

    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(fullPayload));

    const signature = crypto
      .createHmac('sha256', this.secret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  /**
   * Verifies and decodes a JWT access token
   */
  async verifyAccessToken(token: string): Promise<JwtPayload | null> {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const [headerB64, payloadB64, signatureB64] = parts;

      // Check blacklist in cache
      const isBlacklisted = await this.cache.get(`token:blacklist:${token}`);
      if (isBlacklisted) return null;

      // Verify HMAC signature
      const expectedSignature = crypto
        .createHmac('sha256', this.secret)
        .update(`${headerB64}.${payloadB64}`)
        .digest('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');

      if (!crypto.timingSafeEqual(Buffer.from(signatureB64), Buffer.from(expectedSignature))) {
        return null;
      }

      const payload = JSON.parse(this.base64UrlDecode(payloadB64)) as JwtPayload;

      // Verify expiration & issuer
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        return null;
      }
      if (payload.iss && payload.iss !== this.issuer) {
        return null;
      }

      return payload;
    } catch {
      return null;
    }
  }

  /**
   * Generates a cryptographically secure refresh token
   */
  async generateRefreshToken(userId: string): Promise<string> {
    const refreshToken = `sat_ref_${crypto.randomBytes(32).toString('hex')}`;
    await this.cache.set(`refresh:${refreshToken}`, { userId }, this.refreshTokenTtlSeconds);
    return refreshToken;
  }

  /**
   * Verifies a refresh token and retrieves the associated user ID
   */
  async verifyRefreshToken(refreshToken: string): Promise<string | null> {
    const data = await this.cache.get<{ userId: string }>(`refresh:${refreshToken}`);
    if (!data) return null;
    return data.userId;
  }

  /**
   * Revokes a refresh token
   */
  async revokeRefreshToken(refreshToken: string): Promise<void> {
    await this.cache.del(`refresh:${refreshToken}`);
  }

  /**
   * Blacklists an active access token until its expiration
   */
  async blacklistAccessToken(token: string): Promise<void> {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(this.base64UrlDecode(parts[1])) as JwtPayload;
        const now = Math.floor(Date.now() / 1000);
        const remainingTtl = Math.max(1, (payload.exp || now + 900) - now);
        await this.cache.set(`token:blacklist:${token}`, true, remainingTtl);
      }
    } catch {
      await this.cache.set(`token:blacklist:${token}`, true, 900);
    }
  }
}

export const jwtService = new JwtService();
