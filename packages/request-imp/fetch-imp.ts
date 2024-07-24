import { Info, Method } from "../shared/type";
import { Requestor } from "../request-core/requestor";
import { joinParams } from "../shared/params";
import { noop } from "../shared/utils";

type Options = {
  baseUrl?: string;
  timeout?: number;
  requestInterceptor?: (url: string, options: RequestInit) => void;
  responseInterceptor?: (response: Response) => void;
};

function timeoutPromise(duration: number) {
  return new Promise((res, rej) => {
    setTimeout(() => {
      rej(new Error(`fetch timeout ${duration}ms`));
    }, duration);
  });
}

//实现request-core暴露的接口
export class FetchService implements Requestor {
  private readonly baseUrl;
  private readonly timeout;
  private readonly requestInterceptor;
  private readonly responseInterceptor;
  constructor(options: Options = {}) {
    this.baseUrl = options.baseUrl || "";
    this.timeout = options.timeout || 5000;
    this.requestInterceptor = options.requestInterceptor || noop;
    this.responseInterceptor = options.responseInterceptor || noop;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  get<T>(url: string, info?: Info): Promise<T> {
    if (info && info.params) url += joinParams(info.params);
    return Promise.race([
      this._request<T>(url, "GET", info),
      timeoutPromise(this.timeout) as Promise<T>,
    ]);
  }

  post<T>(url: string, info?: Info): Promise<T> {
    return Promise.race([
      this._request<T>(url, "POST", info),
      timeoutPromise(this.timeout) as Promise<T>,
    ]);
  }

  put<T>(url: string, info?: Info): Promise<T> {
    return Promise.race([
      this._request<T>(url, "PUT", info),
      timeoutPromise(this.timeout) as Promise<T>,
    ]);
  }

  delete<T>(url: string, info?: Info): Promise<T> {
    if (info && info.params) url += joinParams(info.params);
    return Promise.race([
      this._request<T>(url, "DELETE", info),
      timeoutPromise(this.timeout) as Promise<T>,
    ]);
  }

  private async _request<T>(
    url: string,
    method: Method,
    info?: Info
  ): Promise<T> {
    url = this.baseUrl + url;
    const options: RequestInit = {
      method,
      headers: new Headers({
        "Content-Type": "application/json",
        ...info?.headers,
      }),
    };
    if (info?.body && !(info.body instanceof FormData)) {
      options.body = JSON.stringify(info.body);
    } else if (info?.body && info.body instanceof FormData) {
      options.body = info.body;
    }
    this.requestInterceptor(url, options);
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    this.responseInterceptor(response);
    const data: T = await response.json();
    return data;
  }
}
