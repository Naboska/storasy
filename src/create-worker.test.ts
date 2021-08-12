import { IStorasyItem, TStorasyFetcher } from './types';
import { call, put } from './utils';
import { createWorker, getAbortControllerInstance } from './create-worker';
import { createItem } from './create-item';
import { enableFetchMocks } from 'jest-fetch-mock';

type TParams = { url: string };

enableFetchMocks();

const text = 'missed a put from the generator';

(fetch as any).mockResponse(() => Promise.resolve().then(() => text));

const cancelableFetch = ({ params, signal }: TStorasyFetcher<TParams>) =>
  fetch(params.url, { signal }).then(r => r.text());

const badFetcher = ({ params }: TStorasyFetcher<TParams>) =>
  fetch(params.url).then(() => {
    throw new Error('error');
  });

const createOneWork = () => {
  let isRun = false;

  return function* workGenerator(
    params: TParams,
    fetch: (arg: TStorasyFetcher) => Promise<unknown>
  ) {
    try {
      yield (isRun = true);
      yield call(fetch, { params });
      if (!isRun) yield put('test');
    } catch (e) {}
  };
};

const setup = () => {
  const instance: Map<string, IStorasyItem<unknown, AbortController>> = new Map();

  const getStore = <ItemState>() =>
    instance as Map<string, IStorasyItem<ItemState, AbortController>>;

  instance.set('test', createItem());

  const worker = createWorker({ getStore });

  return {
    getStore,
    worker,
  };
};

beforeEach(() => {
  fetchMock.doMock();
});

describe('test worker', () => {
  test('should work correctly default abort controller', () => {
    const abortSpy = jest.spyOn(AbortController.prototype, 'abort');
    const { createAbortController, abort, getSignal } = getAbortControllerInstance();
    const controller = createAbortController();

    expect(getSignal(controller)).toEqual(controller.signal);

    abort(controller);
    expect(abortSpy).toBeCalledTimes(1);

    abortSpy.mockRestore();
  });

  test('should work correctly default abort controller from worker', () => {
    const abortSpy = jest.spyOn(AbortController.prototype, 'abort');
    const { worker } = setup();
    const KEY = 'test';

    const workGenerator = createOneWork();
    worker.run(KEY, workGenerator({ url: '/test' }, cancelableFetch));

    worker.cancel(KEY);
    expect(abortSpy).toBeCalledTimes(1);

    abortSpy.mockRestore();
  });

  test('should bad request set error', async () => {
    const { worker, getStore } = setup();

    const workGenerator = createOneWork();
    worker.run('test', workGenerator({ url: '/test' }, badFetcher));

    await new Promise(resolve => setTimeout(resolve, 1000));

    const item = getStore().get('test').getItem();

    expect(item.isError).toBeTruthy();
  });

  test('should work abort after refetch', async () => {
    const abortSpy = jest.spyOn(AbortController.prototype, 'abort');

    const { worker, getStore } = setup();

    const workGenerator = createOneWork();
    const refetch = () => worker.run('test', workGenerator({ url: '/test' }, cancelableFetch));
    refetch();
    refetch();

    expect(abortSpy).toBeCalledTimes(1);
    abortSpy.mockRestore();
    await new Promise(resolve => setTimeout(resolve, 1000));

    const item = getStore().get('test').getItem();
    expect(item.state).toBe(text);
  });
});
