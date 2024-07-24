# requestors

> This is a lightweight request library that supports request caching, retrying, serial, idempotent, and concurrent.

At present, the underlying basic request based on Fetch encapsulation, the use of dependency inversion principle for the design, the core implementation of the logic and the underlying request library decoupled from the implementation of the library , you can easily switch to the underlying request library implementation , such as switching to axios and so on.



## mounting

```
npm i requestors
yarn add requestors
pnpm i requestors
```



## Basic use

```ts
import {
  FetchService,
  inject,
  useRequestor
} from "requestors";

// Injecting into the underlying request library
inject(
  new FetchService({
    baseUrl: "https://xxx.com",
    timeout: 3000,
    requestInterceptor: (url, options) => {
        // request interceptor
    },
    responseInterceptor: (res) => {
        // Response Interceptor
    },
  })
);

// This is a pure requester
const requestor = useRequestore()
requestor.get('/api/userInfo',{
    params:{...}
	headers:{...}
})
requestor.post(...)
requestor.put(...)
requestor.delete(...)
```



## Request Cache

```ts
import { createCacheRequestor } from 'requestors'
..........
..........
// Injecting into the underlying request library

const requestor = createCacheRequestor({
  expire: 1000 * 60 * 2, // expiration date
  maxCount: 10, // Maximum number of caches
  isPersist: true, // Whether to enable persistent caching
  key(config){
      return 'Returns the specified key as the cache identifier'
  }
});

requestor.get('/api/userInfo')  // send a request
requestor.get('/api/userInfo')  // No more requests, use cached results
```



## Request Concurrency

```ts
import { createConcurrentRequestor } from 'requestors'
..........
..........
// Injecting into the underlying request library

const requestor = createConcurrentRequestor({
  maxCount: 10, // Maximum number of concurrency
});

requestor.post(...)
requestor.put(...)
requestor.delete(...)
.......
```



## Request Idempotent

```ts
import { createIdempotentRequestor } from 'requestors'
..........
..........
// Injecting into the underlying request library

const requestor = createIdempotentRequestor();

requestor.post(...)
requestor.put(...)
requestor.delete(...)
.......
```



## Request Retry

```ts
import { createRetryRequestor } from 'requestors'
..........
..........
// Injecting into the underlying request library

const requestor = createRetryRequestor({
    maxCount: 5;  // Retries
    delay: 100;   // Time between each retry
});

requestor.post(...)
requestor.put(...)
requestor.delete(...)
.......
```



## Request Serial

```ts
import { createSerialRequestor } from 'requestors'
..........
..........
// Injecting into the underlying request library

const requestor = createSerialRequestor();

const config = [
  {
    method: "post",
    url: "/reg",
    info:{
      body:{
          loginId:'admin',
          loginPwd:'123123'
      }  
    },
    passValue: (res) => { // Deep merge the passValue return value with the info of the next request, then issue the request
      return {
        body: {
          ...res.data,
        },
      };
    },
  },
  {
    method: "post",
    url: "/login",
    info: {
      body: {
          ...
      },
    },
  },
];

requestor(config).then(res=>{
    console.log(res) // [...]
})
```

