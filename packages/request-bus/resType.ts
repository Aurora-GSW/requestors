//约定响应格式
export type Res<T> = {
  code: number;
  msg: string;
  data: T;
};
