import Redis from 'ioredis';
import { env } from '../config/env';

let redisInstance: Redis | null = null;

export function getRedis(): Redis {
    if (!redisInstance) {
        const cacheUrl = env.CACHE_URL;
        if (!cacheUrl) throw new Error('CACHE_URL must be defined');

        const parsed = new URL(cacheUrl);

        redisInstance = new Redis({
            host: parsed.hostname,
            port: Number(parsed.port) || 6379,
            password: parsed.password || undefined,
            db: Number(parsed.searchParams.get('db') ?? 0),
            lazyConnect: true,
            // Không crash app nếu Redis không available
            enableOfflineQueue: false,
            retryStrategy: (times) => (times > 3 ? null : Math.min(times * 200, 2000)),
        });

        redisInstance.on('error', (err) => {
            console.error('[Cache/Redis] connection error:', err.message);
        });
    }
    return redisInstance;
}
