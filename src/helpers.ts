export const isPromise = (promise: unknown): promise is Promise<any> =>
  !!promise && Promise.resolve(promise) === promise;

export const isFn = <Fn extends (...args: any[]) => any>(fn: unknown): fn is Fn =>
  typeof fn === 'function';
