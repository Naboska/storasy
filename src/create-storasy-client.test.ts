import { createStorasyClient } from './create-storasy-client';
import { call, put, go } from './utils';
import { TStorasyFetcher } from './types';

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

const setup = (key: string) => {
  let state: TTest | null = null;

  const storasyClient = createStorasyClient();
  storasyClient.create(key);
  expect(state).toBe(null);

  storasyClient.subscribe<TTest>(key, item => (state = item.state));
  expect(state).toBe(undefined);

  return {
    getState: () => state,
    storasyClient,
  };
};

describe('client test', () => {
  test('should item create', () => {
    const KEY = 'test';
    const { storasyClient } = setup(KEY);

    const isInclude = storasyClient.instance.has(KEY);
    expect(isInclude).toBe(true);
  });

  test('should item change from put', () => {
    const KEY = 'test';
    const { storasyClient, getState } = setup(KEY);

    storasyClient.put<TTest>('test', INITIAL_ONE);
    expect(getState()).toBe(INITIAL_ONE);
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
});
