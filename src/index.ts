import { storasy } from './storasy';

export { ABORT_CONTROLLER_MESSAGE } from './constants';

export { initStoreOptions, getInitialItem } from './utils';

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

export default storasy;
