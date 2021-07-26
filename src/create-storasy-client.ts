import { createItem } from './create-item';
import { createAsync } from './create-async';
import type {
  TStorasyClient,
  IStorasyItem,
  TStorasyItemSubscribe,
  TStorasyItemEditState,
} from './types';
import { TStorasyRunOptions } from './types';

export const createStorasyClient = <GAbortController = AbortController>({
  abortController,
}: TStorasyClient<GAbortController> = {}) => {
  const instance: Map<string, IStorasyItem<unknown, GAbortController>> = new Map();

  const _getStore = <ItemState>() =>
    instance as Map<string, IStorasyItem<ItemState, GAbortController>>;

  const async = createAsync<GAbortController>({ abortController, getStore: _getStore });

  const _getItem = <ItemState>(key: string, initial?: ItemState) => {
    const store = _getStore<ItemState>();
    const include = store.has(key);

    if (!include) store.set(key, createItem<ItemState, GAbortController>(initial));

    return store.get(key);
  };

  return {
    get instance() {
      return instance;
    },
    create: _getItem,
    put<T>(key: string, data: T | TStorasyItemEditState<T>) {
      const store = _getStore<T>();
      const include = store.has(key);

      if (include) store.get(key).putState(data);
    },
    run<ItemState, Params = any>(
      key: string,
      generator: (params?: Params) => Generator<any>,
      options: TStorasyRunOptions<Params> = {}
    ) {
      const { enabled = true, params } = options;

      const runGenerator = (newParams?: Params) =>
        async.runner<ItemState>(key, generator(newParams ?? params));

      if (enabled) runGenerator();

      return { refetch: runGenerator };
    },
    subscribe<T>(key: string, subscribe: TStorasyItemSubscribe<T>) {
      const item = _getItem<T>(key);

      return item.subscribe(subscribe);
    },
  };
};
