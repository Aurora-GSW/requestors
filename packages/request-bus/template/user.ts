import { cacheRequestor } from "../request";
import { Res } from "../resType";

type Data = Res<{
  name: string;
  age: number;
}>;
export function getUserInfo(id: string) {
  return cacheRequestor.get<Data>("abc");
}
async function a() {
  const obj = await getUserInfo("a");
}
