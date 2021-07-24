import { isPromise } from './utils';
import type { ICreateItem } from './create-item';
import type { TStorasyClient } from './create-storasy-client';
import { ABORT_CONTROLLER_MESSAGE } from './constants';

type TCreateAsync<GAbortController> = Pick<
  TStorasyClient<GAbortController>,
  'abortController' | 'abortSignal' | 'abort'
> & {
  getStore: <T>() => Map<string, ICreateItem<T>>;
};

type TError = Error & { status: string };

export const createAsync = <GAbortController>({
  getStore,
  abortController: userAbortController,
  abort: userAbortSignal,
  abortSignal: userAbort,
}: TCreateAsync<GAbortController>) => {
  const abortController = userAbortController ?? (() => new AbortController());
  const abortSignal = userAbortSignal ?? ((controller: AbortController) => controller.signal);
  const abort = userAbort ?? ((controller: AbortController) => controller.abort());

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
    const result = generator.next(payload);
    const isProcessing = !result.done && store.has(key);
    let action = result.value;

    if (isProcessing) {
      if (typeof action === 'function') {
        const item = store.get(key);
        action(item);
      }

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
