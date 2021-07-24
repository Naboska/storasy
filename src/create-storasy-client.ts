import type { ICreateItem, TItemSubscribe } from './create-item';
import { createItem, TEditState } from './create-item';
import { createAsync } from './create-async';

export type TAbortController<AbortController> = {
  createAbortController: () => AbortController;
  getSignal: (controller: AbortController) => any;
  abort: (controller: AbortController) => any;
};

export type TStorasyClient<AbortController> = {
  abortController?: TAbortController<AbortController>;
};

export const createStorasyClient = <GAbortController = AbortController>({
  abortController,
}: TStorasyClient<GAbortController> = {}) => {
  const instance = new Map();

  const _getStore = <T>() => instance as Map<string, ICreateItem<T, GAbortController>>;

  const async = createAsync<GAbortController>({ abortController, getStore: _getStore });

  const _getItem = <T>(key: string, initial?: T) => {
    const store = _getStore<T>();
    const include = store.has(key);

    if (!include) store.set(key, createItem<T, GAbortController>(initial));

    return store.get(key);
  };

  return {
    create: _getItem,
    put<T>(key: string, data: T | TEditState<T>) {
      const store = _getStore<T>();
      const include = store.has(key);

      if (include) store.get(key).putState(data);
    },
    run<T>(key: string, generator: () => Generator<any>) {
      const instance = generator();

      async.runner<T>(key, instance);
    },
    subscribe<T>(key: string, subscribe: TItemSubscribe<T>) {
      const item = _getItem<T>(key);

      return item.subscribe(subscribe);
    },
  };
};
