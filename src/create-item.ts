import { createEvents } from './create-events';

export type TEditState<T> = (oldState: T | undefined) => T;

type TItemStatus = 'stale' | 'loading' | 'loaded';

export type TItem<T> = {
  state: T;
  status: TItemStatus;
  error?: string;
  isLoaded: boolean;
  isLoading: boolean;
  isError: boolean;
  isStale: boolean;
};

export type TItemSubscribe<T> = (item: TItem<T>) => void;

export interface ICreateItem<T> {
  getState: () => T;
  putState: (newState: T | TEditState<T>) => void;
  putStatus: (newStatus: Exclude<TItemStatus, 'stale'>) => void;
  putItem: (newState: T, newStatus: Exclude<TItemStatus, 'stale'>, newError?: string) => void;
  subscribe: (sub: TItemSubscribe<T>) => () => void;
}

export const createItem = <T>(initial?: T): ICreateItem<T> => {
  let state = initial;
  let status: TItemStatus = 'stale';
  let error: string = undefined;

  const subscribers = createEvents<(state: TItem<T>) => void>();

  const _notify = () => subscribers.call(_getItem());

  const _getItem = () => ({
    state,
    status,
    error,
    isLoaded: status === 'loaded',
    isLoading: status === 'loading',
    isError: Boolean(error),
    isStale: status === 'stale',
  });

  return {
    getState: () => state,
    putState(newState) {
      state = typeof newState === 'function' ? (newState as TEditState<T>)(state) : newState;
      _notify();
    },
    putStatus(newStatus) {
      status = newStatus;
      _notify();
    },
    putItem(newState, newStatus, newError) {
      state = newState;
      status = newStatus;
      error = newError;
      _notify();
    },
    subscribe(sub) {
      sub(_getItem());
      return subscribers.push(sub);
    },
  };
};
