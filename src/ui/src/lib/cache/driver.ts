import Redis from 'ioredis';
import { LRUCache } from 'lru-cache';
import { getRedis } from './redis';

/**
 * CacheDriver: Redis L2 + LRU Memory L1
 * Adapted from p1/src/lib/services/cache/driver.ts
 * Key prefix: commics:
 */
export class CacheDriver {
    private redis?: Redis;
    private memory?: LRUCache<string, any>;
    private ttl = 30_000; // ms
    private prefix = 'commics:';

    init(url: string) {
        const parsed = new URL(url);
        const protocol = parsed.protocol.replace(':', '');
        const params = parsed.searchParams;

        this.ttl = Number(params.get('ttl') ?? 30_000);
        const lruSize = Number(params.get('lru') ?? 5_000);

        if (protocol === 'redis+memory') {
            this.memory = new LRUCache<string, any>({ max: lruSize, ttl: 3_000 });
        }

        try {
            this.redis = getRedis();
        } catch {
            console.warn('[Cache] Redis not available, using memory-only fallback');
        }
    }

    private key(raw: string) {
        return `${this.prefix}${raw}`;
    }

    async get(_key: string): Promise<any> {
        const key = this.key(_key);

        // L1: Memory first
        if (this.memory) {
            const memVal = this.memory.get(key);
            if (memVal !== undefined) return memVal;
        }

        // L2: Redis
        if (this.redis) {
            try {
                const raw = await this.redis.get(key);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    this.memory?.set(key, parsed);
                    return parsed;
                }
            } catch (err) {
                console.error('[Cache] redis get error:', (err as Error).message);
            }
        }

        return null;
    }

    async set(_key: string, value: any, ttlMs?: number): Promise<void> {
        const key = this.key(_key);
        const ttl = ttlMs ?? this.ttl;
        const exSeconds = Math.ceil(ttl / 1000);

        this.memory?.set(key, value);

        if (this.redis) {
            try {
                if (exSeconds > 0) {
                    await this.redis.set(key, JSON.stringify(value), 'EX', exSeconds);
                } else {
                    await this.redis.set(key, JSON.stringify(value));
                }
            } catch (err) {
                console.error('[Cache] redis set error:', (err as Error).message);
            }
        }
    }

    async del(_key: string): Promise<void> {
        const key = this.key(_key);
        this.memory?.delete(key);
        try {
            await this.redis?.del(key);
        } catch (err) {
            console.error('[Cache] redis del error:', (err as Error).message);
        }
    }

    async addTags(cacheKey: string, tags: string[]): Promise<void> {
        for (const tag of tags) {
            const tagKey = `tag:${tag}`;
            const raw = await this.get(tagKey) as string | null;
            let keys: string[] = [];
            try { keys = raw ? JSON.parse(raw) : []; } catch { keys = []; }
            if (!keys.includes(cacheKey)) {
                keys.push(cacheKey);
                await this.set(tagKey, JSON.stringify(keys), 0);
            }
        }
    }

    async invalidateTag(tag: string): Promise<void> {
        const tagKey = `tag:${tag}`;
        const raw = await this.get(tagKey) as string | null;
        const keys: string[] = raw ? JSON.parse(raw) : [];
        for (const k of keys) {
            await this.del(k);
        }
        await this.del(tagKey);
        console.log(`[Cache] invalidateTag: ${tag} (${keys.length} keys cleared)`);
    }
}
