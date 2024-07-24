export function joinParams(params: { [key: string]: string }) {
  let str = "?";
  for (const key in params) {
    str += `${key}=${params[key]}&`;
  }
  return str.slice(0, -1);
}
