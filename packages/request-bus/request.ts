import {
  createCacheRequestor,
  createConcurrentRequestor,
  createIdempotentRequestor,
  createRetryRequestor,
  createSerialRequestor,
  useRequestor,
} from "../request-core";

//导出所有功能对应的requestor
export const cacheRequestor = createCacheRequestor();
export const concurrentRequestor = createConcurrentRequestor();
export const idempotentRequestor = createIdempotentRequestor();
export const retryRequestor = createRetryRequestor();
export const serialRequestor = createSerialRequestor();
export const requestor = useRequestor();
