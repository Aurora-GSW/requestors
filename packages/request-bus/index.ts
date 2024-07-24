import { inject } from "../request-core";
import { FetchService } from "../request-imp";

//将请求底层实现注入给request-core
inject(new FetchService());
