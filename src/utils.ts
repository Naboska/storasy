import { TAsyncEvents, TStoreItem } from './types';
import { storasy } from './storasy';

export const isPromise = (promise: any): boolean => promise && Promise.resolve(promise) === promise;

export const initStoreOptions = ({ asyncEvents }: { asyncEvents: TAsyncEvents }) => {
  storasy.setAsyncEvents(asyncEvents);
};

export const getInitialItem = (): TStoreItem => ({
  state: {
    data: undefined,
    isLoading: false,
    isError: false,
    isLoaded: false,
    error: undefined,
  },
  subscribers: [],
});
