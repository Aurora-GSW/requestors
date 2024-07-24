import { AnyObject } from "./type";

export function noop() {}

export function deepMerge(target: AnyObject, source: AnyObject) {
  if (typeof target !== "object" || target === null) {
    return source;
  }

  if (typeof source !== "object" || source === null) {
    return target;
  }

  const result: AnyObject = Array.isArray(target) ? [...target] : { ...target };

  for (const key in source) {
    if (!source.hasOwnProperty(key)) continue;
    if (Array.isArray(source[key]) && Array.isArray(result[key])) {
      result[key] = result[key].concat(source[key]);
    } else if (
      typeof source[key] === "object" &&
      source[key] !== "null" &&
      typeof result[key] === "object" &&
      result[key] !== "null"
    ) {
      result[key] = deepMerge(result[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }

  return result;
}
