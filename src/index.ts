import { storasy } from './storasy';

export { initStoreOptions } from './utils';

export const {
  getItem,
  setItem,
  call,
  runner,
  subscribe,
  removeSubscriber,
  getAbortController,
  setAsyncEvents,
  getAsyncEvents,
} = storasy;

export type { TAsyncEvents, TStoreItemData, TStoreSubscriber } from './types';
