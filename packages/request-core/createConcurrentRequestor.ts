import { Info } from "../shared/type";
import { Requestor, useRequestor } from "./requestor";

type Options = {
  maxCount: number;
};

type Task = {
  cb: <T>() => Promise<T>;
  resolve: (...args: any[]) => void;
  reject: (...args: any[]) => void;
};

const defaultOptions = {
  maxCount: 5,
};

class Scheduler {
  private readonly taskList: Task[] = [];

  private currentPerformCount: number = 0;

  constructor(private readonly maxCount: number) {}

  addTask(task: Task) {
    if (this.currentPerformCount < this.maxCount) {
      this.currentPerformCount++;
      this.run(task);
    } else {
      this.taskList.push(task);
    }
  }

  run({ cb, resolve, reject }: Task) {
    cb()
      .then(resolve, reject)
      .finally(() => {
        this.currentPerformCount--;
        const task = this.taskList.shift();
        if (task) {
          this.currentPerformCount++;
          this.run(task);
        }
      });
  }
}

function processConcurrent<T>(scheduler: Scheduler, cb: Task["cb"]) {
  return new Promise<T>((resolve, reject) => {
    scheduler.addTask({
      cb,
      resolve,
      reject,
    });
  });
}

export function createConcurrentRequestor(options?: Options) {
  const config = { ...defaultOptions, ...options };
  const baseReq = useRequestor();
  const scheduler = new Scheduler(config.maxCount);
  let req = { getBaseUrl: baseReq.getBaseUrl.bind(baseReq) } as Requestor;

  req.get = <T>(url: string, info?: Info) => {
    return processConcurrent<T>(scheduler, () => baseReq.get(url, info));
  };

  req.post = <T>(url: string, info?: Info) => {
    return processConcurrent<T>(scheduler, () => baseReq.post(url, info));
  };

  req.put = <T>(url: string, info?: Info) => {
    return processConcurrent<T>(scheduler, () => baseReq.put(url, info));
  };

  req.delete = <T>(url: string, info?: Info) => {
    return processConcurrent<T>(scheduler, () => baseReq.delete(url, info));
  };

  return req;
}
