type CacheMeta<T = any> = {
  expire: number;
  startTime: number;
  data: Promise<T>;
};

//所有cacheStore必须实现该接口
export interface CacheStore {
  has(key: string): Promise<boolean>;
  get<T>(key: string): Promise<CacheMeta<T> | undefined>;
  set<T>(key: string, value: CacheMeta<T>): Promise<void>;
  delete(key: string): Promise<boolean>;
}

export type CacheStoreOptions = {
  isPersist?: boolean;
  maxCount?: number;
};
const defaultOptions: Required<CacheStoreOptions> = {
  isPersist: false,
  maxCount: 20,
};
export function useCacheStore(options?: CacheStoreOptions): CacheStore {
  const config = { ...defaultOptions, ...options };
  if (!config.isPersist) return new MemoryCache(config.maxCount);
  return new PersistCache(config.maxCount);
}

//LRU缓存淘汰
class PersistCache implements CacheStore {
  private readonly usedOrderKey: string = "USEDORDER";
  constructor(private maxCount: number) {
    this.initUsedOrderArr();
  }

  async initUsedOrderArr() {
    const exist = await this.has(this.usedOrderKey);
    if (!exist) localStorage.setItem(this.usedOrderKey, JSON.stringify([]));
  }

  async has(key: string) {
    const res = localStorage.getItem(key);
    return !!res;
  }

  async get<T>(key: string) {
    let res = localStorage.getItem(key);
    if (!res) return;
    let orderArr: string[] = JSON.parse(
      localStorage.getItem(this.usedOrderKey)!
    );
    orderArr = orderArr.filter((id) => key !== id);
    orderArr.push(key);
    localStorage.setItem(this.usedOrderKey, JSON.stringify(orderArr));
    return JSON.parse(res);
  }

  async set<T>(key: string, value: CacheMeta<T>) {
    const exist = await this.has(key);
    let orderArr: string[] = JSON.parse(
      localStorage.getItem(this.usedOrderKey)!
    );
    if (exist) orderArr = orderArr.filter((id) => key !== id);
    if (orderArr.length >= this.maxCount) {
      localStorage.removeItem(orderArr[0]);
      orderArr.shift();
    }
    orderArr.push(key);
    localStorage.setItem(this.usedOrderKey, JSON.stringify(orderArr));
    localStorage.setItem(key, JSON.stringify(value));
  }

  async delete(key: string) {
    const exist = await this.has(key);
    if (exist) {
      let orderArr: string[] = JSON.parse(
        localStorage.getItem(this.usedOrderKey)!
      );
      orderArr = orderArr.filter((id) => key !== id);
      localStorage.setItem(this.usedOrderKey, JSON.stringify(orderArr));
    }
    localStorage.removeItem(key);
    return exist;
  }
}

//LRU缓存淘汰
class MemoryCache implements CacheStore {
  private readonly map: Map<string, CacheMeta> = new Map();

  constructor(private maxCount: number) {
    if (maxCount > 20) this.maxCount = 20;
  }

  async has(key: string) {
    return this.map.has(key);
  }

  async get<T>(key: string) {
    if (!this.map.has(key)) return;
    const res = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, res as any);
    return res;
  }

  async set<T>(key: string, value: CacheMeta<T>) {
    if (this.map.has(key)) {
      this.map.delete(key);
    }
    if (this.maxCount <= this.map.size) {
      const keys = this.map.keys();
      const { value } = keys.next();
      this.map.delete(value);
    }
    this.map.set(key, value);
  }

  async delete(key: string) {
    return this.map.delete(key);
  }
}
