import { AnyObject, Info, Params, UseMethod } from "../shared/type";
import { joinParams } from "../shared/params";
import { CacheStore, CacheStoreOptions, useCacheStore } from "./cacheStore";
import { Requestor, useRequestor } from "./requestor";
import md5 from "md5";

export type KeyConfig = {
  path: string;
  params?: Params;
  body?: AnyObject;
  headers?: Params;
  method: UseMethod;
};
type Options = {
  expire?: number;
  key?: (config: KeyConfig) => string;
} & CacheStoreOptions;

const defaultOptions: Required<Options> = {
  expire: 1000 * 60 * 60 * 6,
  key({ path, params, body, method, headers }: KeyConfig) {
    const paramsStr = params ? joinParams(params) : "";
    return (
      method + path + paramsStr + JSON.stringify(headers) + JSON.stringify(body)
    );
  },
  isPersist: false,
  maxCount: 20,
};

async function requestCache<T>(
  method: UseMethod,
  baseReq: Requestor,
  cacheStore: CacheStore,
  config: Required<Options>,
  url: string,
  info: Info = {}
) {
  const keyConfig: KeyConfig = {
    path: baseReq.getBaseUrl() + url,
    params: info.params,
    body: info.body,
    headers: info.headers,
    method,
  };
  let key = config.key(keyConfig);
  if (typeof key !== "string") {
    throw new Error("key is not a string");
  }
  key = md5(key);
  const cache = await cacheStore.get<T>(key);
  if (cache && Date.now() - cache.startTime < cache.expire) {
    return cache.data;
  }

  const res = baseReq[method]<T>(url, info);

  cacheStore.set(key, {
    expire: config.expire,
    startTime: Date.now(),
    data: res,
  });

  return res;
}

export function createCacheRequestor(options?: Options): Requestor {
  const config = { ...defaultOptions, ...options };
  const baseReq = useRequestor();
  const cacheStore = useCacheStore(config);

  let req = { getBaseUrl: baseReq.getBaseUrl.bind(baseReq) } as Requestor;

  req.get = <T>(url: string, info?: Info) => {
    return requestCache<T>("get", baseReq, cacheStore, config, url, info);
  };

  req.post = <T>(url: string, info?: Info) => {
    return requestCache<T>("post", baseReq, cacheStore, config, url, info);
  };

  req.put = <T>(url: string, info?: Info) => {
    return requestCache<T>("put", baseReq, cacheStore, config, url, info);
  };

  req.delete = <T>(url: string, info?: Info) => {
    return requestCache<T>("delete", baseReq, cacheStore, config, url, info);
  };

  return req;
}
