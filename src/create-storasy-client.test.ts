import { createStorasyClient } from './create-storasy-client';
import { call, put, go } from './utils';
import { TAbortController, TStorasyFetcher } from './types';

type TTest = {
  test: string;
};

const INITIAL_ONE = { test: 'test' };

const fake_req = <Params>({ params }: TStorasyFetcher<Params>) =>
  Promise.resolve(params ?? INITIAL_ONE);

function* controlledGenerator() {
  yield go('loading');
  const result: TTest = yield call(fake_req, { isControl: true });
  yield put<TTest>(result);
}

function* uncontrolledGenerator<Params>(params?: Params) {
  yield call(fake_req, { params });
}

const setup = (key?: string) => {
  const abortControllerInstance = jest.fn();

  const abortController: TAbortController<unknown> = {
    createAbortController: () => abortControllerInstance,
    abort: (controller: any) => controller('abort'),
    getSignal: (controller: any) => controller('signal'),
    checkOnError: () => true,
  };

  const storasyClient = createStorasyClient({ abortController });

  let state: TTest | null = null;
  let unsubscribe;

  if (key) {
    storasyClient.create(key);
    expect(state).toBeNull();

    unsubscribe = storasyClient.subscribe<TTest>(key, item => (state = item.state));
    expect(state).toBeUndefined();
  }

  return {
    getState: () => state,
    storasyClient,
    unsubscribe,
  };
};

describe('client test', () => {
  test('should item create', () => {
    const KEY = 'test';
    const { storasyClient } = setup(KEY);

    const isInclude = storasyClient.include(KEY);
    expect(isInclude).toBeTruthy();
  });

  test('should item does not exist', () => {
    const KEY = 'test';
    const { storasyClient } = setup();

    const item = storasyClient.get(KEY);
    expect(item).toBeNull();
  });

  test('should dont delete item if include subscriber', () => {
    const KEY = 'test';
    const { storasyClient } = setup(KEY);

    expect(storasyClient.delete(KEY)).toBeFalsy();
  });

  test('should delete item', () => {
    const KEY = 'test';
    const withKey = setup(KEY);
    const withoutKey = setup();

    withKey.unsubscribe();

    expect(withKey.storasyClient.delete(KEY)).toBeTruthy();
    expect(withoutKey.storasyClient.delete(KEY)).toBeTruthy();
  });

  test('should item change from put', () => {
    const KEY = 'test';
    const { storasyClient, getState } = setup(KEY);

    storasyClient.put<TTest>('test', INITIAL_ONE);
    expect(getState()).toBe(INITIAL_ONE);
  });

  test('should not give an error if we change a non-existent key', () => {
    const { storasyClient, getState } = setup();

    storasyClient.put('_', INITIAL_ONE);
    expect(getState()).toBeNull();
  });

  test('should item change from controlled generator', async () => {
    const KEY = 'controlledTest';
    const { storasyClient, getState } = setup(KEY);

    storasyClient.run(KEY, controlledGenerator);
    await new Promise(resolve => setTimeout(resolve));
    expect(getState()).toBe(INITIAL_ONE);
  });

  test('should item change from uncontrolled generator', async () => {
    const KEY = 'uncontrolledTest';
    const { storasyClient, getState } = setup(KEY);

    storasyClient.run(KEY, uncontrolledGenerator);
    await new Promise(resolve => setTimeout(resolve));
    expect(getState()).toBe(INITIAL_ONE);
  });

  test('should item change from uncontrolled generator with params', async () => {
    const KEY = 'uncontrolledTestWithParams';
    const { storasyClient, getState } = setup(KEY);

    const checkValue = { [KEY]: KEY };

    storasyClient.run(KEY, uncontrolledGenerator, { params: checkValue });
    await new Promise(resolve => setTimeout(resolve));
    expect(getState()).toBe(checkValue);
  });

  test('should start with a belated function with custom params', async () => {
    const KEY = '_';
    const { storasyClient, getState } = setup(KEY);

    const checkValue = { [KEY]: KEY };
    const checkValue2 = { [KEY]: KEY + KEY };

    const { refetch } = storasyClient.run(KEY, uncontrolledGenerator, {
      enabled: false,
      params: checkValue,
    });
    await new Promise(resolve => setTimeout(resolve));
    expect(getState()).toBeUndefined();

    refetch(checkValue2);
    await new Promise(resolve => setTimeout(resolve));
    expect(getState()).toBe(checkValue2);
  });
});
