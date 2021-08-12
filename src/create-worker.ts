import { isPromise } from './helpers';
import type { TStorasyClientOptions, TAbortController, IStorasyItem } from './types';

type TCreateWorker<AbortController> = Pick<
  TStorasyClientOptions<AbortController>,
  'abortController'
> & {
  getStore: <T>() => Map<string, IStorasyItem<T, AbortController>>;
};

export const getAbortControllerInstance = (): TAbortController<AbortController> => ({
  createAbortController: () => new AbortController(),
  getSignal: controller => controller.signal,
  abort: controller => controller.abort(),
  checkOnError: error => error.name === 'AbortError',
});

export const createWorker = <AbortController = unknown>({
  getStore,
  abortController,
}: TCreateWorker<AbortController>) => {
  const abortControllerInstance = abortController ?? getAbortControllerInstance();

  const _createGeneratorError = (key: string, generator: Generator, error: Error) => {
    const item = getStore<unknown>().get(key);
    const isAbortError = abortControllerInstance.checkOnError(error);

    if (isAbortError) return generator.return(error);

    if (item) {
      const state = item.getState();
      item.putItem(state, 'loaded', error.message);
      generator.throw(error);
    }
  };

  const _runner = <T>(
    key: string,
    generator: Generator,
    payload?: IteratorResult<unknown> | unknown[]
  ) => {
    const store = getStore<T>();
    const item = store.get(key);
    const result = generator.next(payload);
    const isProcessing = !result.done && store.has(key);

    if (isProcessing) {
      const action =
        typeof result.value === 'function'
          ? result.value(item, abortControllerInstance)
          : result.value;

      if (!isPromise(action)) return _runner(key, generator, payload);

      return action.then(
        payload => _runner(key, generator, payload),
        error => _createGeneratorError(key, generator, error)
      );
    }

    return 'final';
  };

  return {
    run: _runner,
    cancel(key: string) {
      const { abort } = abortControllerInstance as TAbortController<AbortController>;
      const item = getStore().get(key);
      const ac = item.getAbortController();

      if (ac) abort(ac);
    },
  };
};
