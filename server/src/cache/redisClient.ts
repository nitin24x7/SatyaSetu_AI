import { Redis, RedisOptions } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL;

const redisOptions: RedisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0', 10),
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 100, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true,
};

export const redisClient = redisUrl
  ? new Redis(redisUrl, { ...redisOptions, lazyConnect: true })
  : new Redis(redisOptions);

redisClient.on('error', (err: Error) => {
  if (process.env.NODE_ENV !== 'test') {
    console.warn('[Redis Client Warning]', err.message);
  }
});

