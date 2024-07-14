import { Params, Requestor } from "../request-core/requestor";
import { Method } from "./type";
import { joinParams } from "./utils/params";

//实现request-core暴露的接口
export class FetchService implements Requestor {
  private requestInterceptors: Array<
    (url: string, options: RequestInit) => void
  > = [];
  private responseInterceptors: Array<(response: Response) => void> = [];

  addRequestInterceptors(
    interceptors: (url: string, options: RequestInit) => void
  ) {
    this.requestInterceptors.push(interceptors);
  }

  addResponseInterceptors(interceptors: (response: Response) => void) {
    this.responseInterceptors.push(interceptors);
  }

  private runRequestInterceptors(url: string, options: RequestInit) {
    this.requestInterceptors.forEach((interceptor) =>
      interceptor(url, options)
    );
  }

  private runResponseInterceptors(response: Response) {
    this.responseInterceptors.forEach((interceptor) => interceptor(response));
  }

  get<T>(url: string, params?: Params): Promise<T> {
    if (params) url += joinParams(params);
    return this._request<T>(url, "GET");
  }

  post<T>(url: string, body: any): Promise<T> {
    return this._request<T>(url, "POST", body);
  }

  put<T>(url: string, body: any): Promise<T> {
    return this._request<T>(url, "PUT", body);
  }

  delete<T>(url: string, params?: Params): Promise<T> {
    if (params) url += joinParams(params);
    return this._request<T>(url, "DELETE");
  }

  private async _request<T>(
    url: string,
    method: Method,
    body?: any
  ): Promise<T> {
    const options: RequestInit = {
      method,
    };
    if (body) options.body = JSON.stringify(body);
    this.runRequestInterceptors(url, options);
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    this.runResponseInterceptors(response);
    const data: T = await response.json();
    return data;
  }
}
