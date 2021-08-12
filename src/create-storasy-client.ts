import { createItem } from './create-item';
import { createWorker } from './create-worker';
import type { TStorasyClient, TStorasyClientOptions, IStorasyItem } from './types';

export const createStorasyClient = <AbortController = unknown>({
  abortController,
}: TStorasyClientOptions<AbortController> = {}): TStorasyClient => {
  const instance: Map<string, IStorasyItem<unknown, AbortController>> = new Map();

  const _getStore = <ItemState>() =>
    instance as Map<string, IStorasyItem<ItemState, AbortController>>;

  const worker = createWorker<AbortController>({ abortController, getStore: _getStore });

  const _getItem = <ItemState>(key: string) => {
    const store = _getStore<ItemState>();

    if (store.has(key)) return store.get(key);

    return null;
  };

  const _createItem = <ItemState>(key: string, initial?: ItemState) => {
    const store = _getStore<ItemState>();
    const include = store.has(key);

    if (!include)
      store.set(
        key,
        createItem<ItemState, AbortController>({ initial })
      );

    return store.get(key);
  };

  return {
    get: _getItem,
    create: _createItem,
    include: key => instance.has(key),
    put<ItemState>(key, data) {
      const store = _getStore<ItemState>();
      const include = store.has(key);

      if (include) store.get(key).putState(data);
    },
    delete(key) {
      if (!instance.has(key)) return true;

      const item = instance.get(key);

      if (!item.subscribersLength) {
        instance.delete(key);
        return true;
      }

      return false;
    },
    run<ItemState, Params = any>(key, generator, options) {
      const { enabled = true, params } = options ?? {};

      const runGenerator = (newParams?: Params) =>
        worker<ItemState>(key, generator(newParams ?? params));

      if (enabled) runGenerator();

      return { refetch: runGenerator };
    },
    subscribe<ItemState>(key, subscriber) {
      const include = instance.has(key);
      const item = include ? _getItem<ItemState>(key) : _createItem<ItemState>(key);

      return item.subscribe(subscriber);
    },
  };
};
