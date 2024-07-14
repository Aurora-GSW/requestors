export type Params = {
  [key: string]: string;
};
// request-imp 必须实现该接口
export interface Requestor {
  get<T>(url: string, params?: Params): Promise<T>;
  post<T>(url: string, body: any): Promise<T>;
  put<T>(url: string, body: any): Promise<T>;
  delete<T>(url: string, params?: Params): Promise<T>;
}

let req: Requestor;

export function inject(request: Requestor) {
  req = request;
}

export function useRequestor() {
  return req;
}
