import { Info } from "../shared/type";
import { Requestor, useRequestor } from "./requestor";

type Options = {
  maxCount?: number;
  delay?: number;
};

const defaultOptions: Required<Options> = {
  maxCount: 5,
  delay: 500,
};

async function retryRequest<T>(
  requestor: Requestor[Exclude<keyof Requestor, "getBaseUrl">],
  maxCount: number,
  delay: number,
  url: string,
  info?: Info
): Promise<T> {
  try {
    const res = await requestor<T>(url, info);
    return res;
  } catch (error) {
    console.error(error);
    if (maxCount > 0) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          retryRequest<T>(requestor, maxCount - 1, delay, url, info).then(
            resolve,
            reject
          );
        }, delay);
      });
    }
    throw error;
  }
}

export function createRetryRequestor(options?: Options): Requestor {
  const config = { ...defaultOptions, ...options };
  const baseReq = useRequestor();
  let req = { getBaseUrl: baseReq.getBaseUrl.bind(baseReq) } as Requestor;

  const get = baseReq.get.bind(baseReq);
  const post = baseReq.post.bind(baseReq);
  const put = baseReq.put.bind(baseReq);
  const _delete = baseReq.delete.bind(baseReq);

  req.get = async <T>(url: string, info?: Info) => {
    return retryRequest<T>(get, config.maxCount, config.delay, url, info);
  };

  req.post = async <T>(url: string, info?: Info) => {
    return retryRequest<T>(post, config.maxCount, config.delay, url, info);
  };

  req.put = async <T>(url: string, info?: Info) => {
    return retryRequest<T>(put, config.maxCount, config.delay, url, info);
  };

  req.delete = async <T>(url: string, info?: Info) => {
    return retryRequest<T>(_delete, config.maxCount, config.delay, url, info);
  };

  return req;
}
