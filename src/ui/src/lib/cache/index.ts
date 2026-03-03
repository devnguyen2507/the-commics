import crypto from 'crypto';
import { env } from '../config/env';
import { CacheDriver } from './driver';

/* ─── Singleton driver ─── */
let _driver: CacheDriver | undefined;

export function getDriver(): CacheDriver {
    if (!_driver) {
        const url = env.CACHE_URL || 'redis+memory://localhost:6379?ttl=300000&lru=5000';
        _driver = new CacheDriver();
        _driver.init(url);
        console.log('[Cache] initialized:', url.split('?')[0]);
    }
    return _driver;
}

/* ─── TTL defaults ─── */
export const CACHE_DEFAULTS = {
    freshTTL: 30_000,   // 30s
    staleTTL: 300_000,  // 5min
};

/* ─── Cache key ─── */
function stableStringify(obj: any): string {
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
        return `{${Object.keys(obj).sort().map(k => `"${k}":${stableStringify(obj[k])}`).join(',')}}`;
    }
    if (Array.isArray(obj)) return `[${obj.map(stableStringify).join(',')}]`;
    return JSON.stringify(obj);
}

export function makeCacheKey(fn: Function, args: unknown): string {
    const hash = crypto
        .createHash('sha1')
        .update(fn.toString() + stableStringify(args))
        .digest('hex');
    return `cache:${hash}`;
}

/* ─── In-flight dedupe ─── */
const flightMap = new Map<string, Promise<any>>();

function scheduleFlight<T>(key: string, fn: () => Promise<T>): Promise<T> {
    if (flightMap.has(key)) return flightMap.get(key)! as Promise<T>;
    const p = (async () => {
        try {
            return await fn();
        } catch (e) {
            console.error('[Cache] flight error for key', key, e);
            throw e;
        } finally {
            flightMap.delete(key);
        }
    })();
    flightMap.set(key, p);
    return p;
}

/* ─── SWR background refresh ─── */
function scheduleSWR<T>(key: string, fn: () => Promise<T>, staleTTL: number) {
    const swrKey = `${key}:swr`;
    scheduleFlight(swrKey, async () => {
        try {
            const fresh = await fn();
            await getDriver().set(key, { value: fresh, storedAt: Date.now() }, staleTTL);
            console.log('[Cache] SWR refreshed:', key.slice(0, 20));
        } catch (err) {
            console.error('[Cache] SWR failed:', key.slice(0, 20), err);
        }
    });
}

/* ─── Core cacheFetch ─── */
export type CacheMode = 'stale-while-revalidate' | 'no-cache' | 'default';

export async function cacheFetch<T>(
    key: string,
    fn: () => Promise<T>,
    mode: CacheMode = 'default',
    options?: { freshTTL?: number; staleTTL?: number },
): Promise<T> {
    const freshTTL = options?.freshTTL ?? CACHE_DEFAULTS.freshTTL;
    const staleTTL = options?.staleTTL ?? CACHE_DEFAULTS.staleTTL;

    if (mode === 'no-cache') return fn();

    const now = Date.now();
    try {
        const cached = await getDriver().get(key) as any;
        if (cached && typeof cached === 'object' && 'storedAt' in cached) {
            const age = now - cached.storedAt;
            if (age <= freshTTL) return cached.value;
            if (mode === 'stale-while-revalidate' && age <= freshTTL + staleTTL) {
                scheduleSWR(key, fn, freshTTL + staleTTL);
                return cached.value;
            }
        } else if (cached !== null) {
            return cached as T;
        }
    } catch (err) {
        console.error('[Cache] read error:', err);
    }

    return scheduleFlight(key, async () => {
        const value = await fn();
        const entry = { value, storedAt: Date.now() };
        try {
            const ttlMs = mode === 'stale-while-revalidate' ? freshTTL + staleTTL : freshTTL;
            await getDriver().set(key, entry, ttlMs);
        } catch (err) {
            console.error('[Cache] write error:', err);
        }
        return value;
    });
}

/* ─── revalidateTag ─── */
export async function revalidateTag(tag: string): Promise<void> {
    await getDriver().invalidateTag(tag);
}

/* ─── withCache HOC ─── */
export interface WithCacheConfig {
    mode?: CacheMode;
    ttl?: number;       // seconds
    staleTTL?: number;  // seconds
    tags?: string[] | ((...args: any[]) => string[]);
}

export function withCache<A extends any[], R, F extends (...args: A) => Promise<R>>(
    fn: F,
    config: WithCacheConfig,
): F {
    const wrapped = async (...args: A): Promise<R> => {
        const { mode = 'stale-while-revalidate', ttl, staleTTL, tags } = config;
        const freshTTL = ttl ? ttl * 1000 : undefined;
        const staleTTLMs = staleTTL ? staleTTL * 1000 : undefined;

        const cacheKey = makeCacheKey(fn, args);
        const value = await cacheFetch(cacheKey, () => fn(...args), mode, { freshTTL, staleTTL: staleTTLMs });

        // Track tags async (non-blocking)
        const resolvedTags = typeof tags === 'function' ? tags(...args) : (tags ?? []);
        if (resolvedTags.length > 0) {
            getDriver().addTags(cacheKey, resolvedTags).catch(err =>
                console.error('[Cache] addTags error:', err)
            );
        }

        return value;
    };
    return wrapped as F;
}
