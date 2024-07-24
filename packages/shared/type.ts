export type Method = "GET" | "POST" | "PUT" | "DELETE";
export type UseMethod = "get" | "post" | "put" | "delete";

export type Params = {
  [key: string]: string;
};

export type Info = {
  params?: Params;
  body?: Object;
  headers?: Params;
};

export type AnyObject = {
  [key: string]: any;
};
