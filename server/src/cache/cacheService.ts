import crypto from 'crypto';
import { redisClient } from './redisClient';

export class CacheService {
  private inMemoryFallback = new Map<string, { value: any; expiresAt: number }>();
  private isConnected = false;

  constructor() {
    this.init();
  }

  private async init() {
    try {
      await redisClient.connect();
      this.isConnected = true;
      console.log('[Redis] Connected successfully to caching cluster.');
    } catch {
      this.isConnected = false;
      // In-memory fallback will handle caching seamlessly if Redis daemon is offline
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      if (this.isConnected) {
        const raw = await redisClient.get(key);
        if (!raw) return null;
        return JSON.parse(raw) as T;
      }
    } catch {
      // Fallback
    }

    // In-memory fallback check
    const item = this.inMemoryFallback.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.inMemoryFallback.delete(key);
      return null;
    }
    return item.value as T;
  }

  async set(key: string, value: any, ttlSeconds = 300): Promise<void> {
    const serialized = JSON.stringify(value);
    try {
      if (this.isConnected) {
        await redisClient.setex(key, ttlSeconds, serialized);
        return;
      }
    } catch {
      // Fallback
    }

    this.inMemoryFallback.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async del(key: string): Promise<void> {
    try {
      if (this.isConnected) {
        await redisClient.del(key);
      }
    } catch {}
    this.inMemoryFallback.delete(key);
  }

  /**
   * Cache-Aside Helper
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds = 300
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;

    const fresh = await fetcher();
    await this.set(key, fresh, ttlSeconds);
    return fresh;
  }

  /**
   * Distributed Lock with TTL (Prevents concurrent review state collision)
   */
  async acquireLock(
    resourceKey: string,
    ttlSeconds = 30
  ): Promise<{ acquired: boolean; token: string }> {
    const token = crypto.randomBytes(16).toString('hex');
    const lockKey = `lock:${resourceKey}`;

    try {
      if (this.isConnected) {
        const result = await redisClient.set(lockKey, token, 'EX', ttlSeconds, 'NX');
        return { acquired: result === 'OK', token };
      }
    } catch {}

    // Fallback in-memory lock
    const existing = this.inMemoryFallback.get(lockKey);
    if (existing && Date.now() < existing.expiresAt) {
      return { acquired: false, token: '' };
    }
    this.inMemoryFallback.set(lockKey, {
      value: token,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
    return { acquired: true, token };
  }

  async releaseLock(resourceKey: string, token: string): Promise<boolean> {
    const lockKey = `lock:${resourceKey}`;
    try {
      if (this.isConnected) {
        const script = `
          if redis.call("get", KEYS[1]) == ARGV[1] then
            return redis.call("del", KEYS[1])
          else
            return 0
          end
        `;
        const res = await redisClient.eval(script, 1, lockKey, token);
        return res === 1;
      }
    } catch {}

    const item = this.inMemoryFallback.get(lockKey);
    if (item && item.value === token) {
      this.inMemoryFallback.delete(lockKey);
      return true;
    }
    return false;
  }

  /**
   * Sliding-window rate limiter
   */
  async checkRateLimit(
    identifier: string,
    limit = 100,
    windowSeconds = 60
  ): Promise<{ allowed: boolean; remaining: number }> {
    const key = `ratelimit:${identifier}`;
    const now = Date.now();
    const windowStart = now - windowSeconds * 1000;

    try {
      if (this.isConnected) {
        const multi = redisClient.multi();
        multi.zremrangebyscore(key, 0, windowStart);
        multi.zadd(key, now, `${now}-${Math.random()}`);
        multi.zcard(key);
        multi.expire(key, windowSeconds);
        const results = await multi.exec();
        const count = (results?.[2]?.[1] as number) || 0;
        return { allowed: count <= limit, remaining: Math.max(0, limit - count) };
      }
    } catch {}

    return { allowed: true, remaining: limit - 1 };
  }

  async checkCacheHealth(): Promise<{ healthy: boolean; latencyMs?: number; error?: string }> {
    const start = Date.now();
    try {
      if (this.isConnected) {
        await redisClient.ping();
        return { healthy: true, latencyMs: Date.now() - start };
      }
      return { healthy: true, latencyMs: 0 }; // in-memory fallback healthy
    } catch (err: any) {
      return { healthy: false, error: err.message };
    }
  }
}

export const cacheService = new CacheService();
