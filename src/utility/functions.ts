import { inject, type InjectionKey } from 'vue';
import type { ValidObjects } from './types';

const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  const props = Object.getOwnPropertyDescriptors(obj);
  for (const prop in props) {
    props[prop].value = deepClone(props[prop].value);
  }
  return Object.create(Object.getPrototypeOf(obj), props) as T;
};

declare global {
  interface Set<T> {
    get(val: T): T | undefined;
  }
}
Set.prototype.get = function (val: any) {
  if (this.has(val)) {
    return val;
  }
  return undefined;
};

const getRandomItemMapSet = <V>(iterable: Map<any, V> | Set<V>): V => {
  return iterable.get(Array.from(iterable.keys())[Math.floor(Math.random() * iterable.size)])!;
};
const lastItemInMap = <K, T>(map: Map<K, T>): [K, T] => Array.from(map).pop()!;
const lastKeyInMap = <K>(map: Map<K, any>): K => Array.from(map.keys()).pop()!;
const lastValueInMap = <V>(map: Map<any, V>): V => Array.from(map.values()).pop()!;

const getRandomItemArray = <T>(array: ArrayLike<T>): T => {
  return array[Math.floor(Math.random() * array.length)];
};

const convertRemToPixels = (rem: number) => {
  return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
};

// from https://logaretm.com/blog/type-safe-provide-inject/
const injectStrict = <T>(key: InjectionKey<T>, fallback?: T) => {
  const resolved = inject(key, fallback);
  if (!resolved) {
    throw new Error(`Could not resolve ${key.description}`);
  }
  return resolved;
};

const isValidObject = (objString: string): objString is ValidObjects => {
  switch (objString) {
    case 'Circle':
    case 'Edge':
      return true;
    default:
      throw false;
  }
};

const delay = (time: number) => {
  return new Promise((resolve) => setTimeout(resolve, time));
};

const easeType = {
  inQuad: (t: number, b: number, c: number, d: number) => {
    t /= d;
    return c * t * t + b;
  },
  outQuad: (t: number, b: number, c: number, d: number) => {
    t /= d;
    return -c * t * (t - 2) + b;
  },
  linear: (t: number, b: number, c: number, d: number) => {
    return (c * t) / d + b;
  },
};

const triggerWithEaseFunc = (
  duration: number,
  times: number,
  ease: (t: number, b: number, c: number, d: number) => number,
  callback: (...args: any) => void,
  done: (...args: any) => void,
) => {
  let last = 0;
  for (let currentFrame = 0; currentFrame < times; currentFrame += 1) {
    const delay = ease(currentFrame, 0, duration, times);
    setTimeout(callback, delay);
    last = delay;
  }
  setTimeout(done, last + 100);
};
const triggerWithEase = {
  custom: (
    duration: number,
    times: number,
    ease: (t: number, b: number, c: number, d: number) => number,
    callback: (...args: any) => void,
    done: (...args: any) => void,
  ) => triggerWithEaseFunc(duration, times, ease, callback, done),
  inQuad: (duration: number, times: number, callback: (...args: any) => void, done: (...args: any) => void) =>
    triggerWithEaseFunc(duration, times, easeType.inQuad, callback, done),
  outQuad: (duration: number, times: number, callback: (...args: any) => void, done: (...args: any) => void) =>
    triggerWithEaseFunc(duration, times, easeType.outQuad, callback, done),
  linear: (duration: number, times: number, callback: (...args: any) => void, done: (...args: any) => void) =>
    triggerWithEaseFunc(duration, times, easeType.linear, callback, done),
};

//const _ =
export {
  deepClone,
  getRandomItemMapSet,
  lastItemInMap,
  lastKeyInMap,
  lastValueInMap,
  getRandomItemArray,
  convertRemToPixels,
  injectStrict,
  isValidObject,
  delay,
  triggerWithEase,
};
