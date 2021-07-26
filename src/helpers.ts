export const isPromise = (promise: any): boolean => promise && Promise.resolve(promise) === promise;
