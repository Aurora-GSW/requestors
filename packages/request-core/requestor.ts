import { Info } from "../shared/type";

// request-imp 必须实现该接口
export interface Requestor {
  get<T>(url: string, info?: Info): Promise<T>;
  post<T>(url: string, info?: Info): Promise<T>;
  put<T>(url: string, info?: Info): Promise<T>;
  delete<T>(url: string, info?: Info): Promise<T>;
  getBaseUrl(): string;
}

let req: Requestor;

export function inject(request: Requestor) {
  req = request;
}

export function useRequestor() {
  return req;
}
