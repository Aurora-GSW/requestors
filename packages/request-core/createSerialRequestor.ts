import { Info, UseMethod } from "../shared/type";
import { useRequestor } from "./requestor";
import { deepMerge } from "../shared/utils";

type config = {
  url: string;
  method?: UseMethod;
  info?: Info;
  passValue?: (res: any) => Info;
};

const defaultConfig: Omit<config, "url"> = {
  method: "get",
};

async function serialRequestor(configs: config[]) {
  const result: any[] = [];
  configs = configs.map((conf) => ({ ...defaultConfig, ...conf }));

  const req = useRequestor();

  let next: Info | null = null;
  for (const conf of configs) {
    try {
      const mergeInfo: Info = deepMerge(next || {}, conf.info || {});
      const res: any = await req[conf.method!](conf.url, mergeInfo);
      result.push(res);
      if (conf.passValue) {
        next = conf.passValue(res);
      } else {
        next = null;
      }
    } catch (error) {
      next = null;
      result.push(null);
      console.error(error);
    }
  }

  return result;
}

export function createSerialRequestor() {
  return serialRequestor;
}
