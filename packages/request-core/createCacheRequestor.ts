import { useCacheStore } from "./cacheStore";
import { useRequestor } from "./requestor";

type Options = {
  persist: boolean;
};
export function createCacheRequestor(options: Options) {
  const req = useRequestor();
  const cacheStore = useCacheStore(options.persist);
  return req;
}
