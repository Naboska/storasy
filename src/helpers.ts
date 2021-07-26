export const isPromise = (promise: any): boolean =>
  !!promise && Promise.resolve(promise) === promise;

export const isFn = (fn: any): boolean => !!fn && typeof fn === 'function';
