import { isPromise } from './helpers';
import { ABORT_CONTROLLER_MESSAGE } from './constants';
import type { TStorasyClient, TAbortController, IStorasyItem } from './types';

type TCreateAsync<AbortController> = Pick<TStorasyClient<AbortController>, 'abortController'> & {
  getStore: <T>() => Map<string, IStorasyItem<T, AbortController>>;
};

type TError = Error & { status: string };

const getInitialAc = (): TAbortController<AbortController> => ({
  createAbortController: () => new AbortController(),
  getSignal: controller => controller.signal,
  abort: controller => controller.abort(),
});

export const createAsync = <AbortController>({
  getStore,
  abortController,
}: TCreateAsync<AbortController>) => {
  const ac = abortController ?? getInitialAc();

  const _createGeneratorError = (key: string, generator: Generator<any>, error: TError) => {
    const item = getStore<unknown>().get(key);

    if (error.message === ABORT_CONTROLLER_MESSAGE) return generator.return(error);

    if (item) {
      const state = item.getState();
      item.putItem(state, 'loaded', error.message);
      generator.throw(error);
    }
  };

  const _runner = <T>(
    key: string,
    generator: Generator<any>,
    payload?: IteratorResult<any> | any[]
  ) => {
    const store = getStore<T>();
    const item = store.get(key);
    const result = generator.next(payload);
    const isProcessing = !result.done && store.has(key);

    if (isProcessing) {
      const action = typeof result.value === 'function' ? result.value(item, ac) : result.value;

      if (!isPromise(action)) return _runner(key, generator, payload);

      return action.then(
        payload => _runner(key, generator, payload),
        error => _createGeneratorError(key, generator, error)
      );
    }

    return 'final';
  };

  return {
    runner: _runner,
  };
};
