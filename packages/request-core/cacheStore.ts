export interface CacheStore {
  has(key: string): Promise<boolean>;
  get<T>(key: string): Promise<T>;
  set<T>(key: string, value: T): Promise<void>;
}

export function useCacheStore(isPersist: boolean): CacheStore {
  if (!isPersist) return createMemoryStore();
  return createStorageStore();
}

function createMemoryStore(): CacheStore {
  console.log(123);
}

function createStorageStore(): CacheStore {}
