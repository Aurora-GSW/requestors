import { KeyConfig, createCacheRequestor } from "./createCacheRequestor";

export function createIdempotentRequestor(key?: (config: KeyConfig) => string) {
  const config = {
    isPersist: false,
    maxCount: 100,
    expire: 1000 * 60 * 2,
  } as any;
  if (key) config.key = key;
  return createCacheRequestor(config);
}
