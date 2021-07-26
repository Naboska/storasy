import { createStorasyClient } from './create-storasy-client';
import { call, put, go } from './utils';

type TTest = {
  test: string;
};

const INITIAL_ONE = { test: 'test' };

const fake_req = () => Promise.resolve(INITIAL_ONE);

function* controlledGenerator() {
  yield go('loading');
  const result: TTest = yield call(fake_req, { isControl: true });
  yield put<TTest>(result);
}

function* uncontrolledGenerator() {
  yield call(fake_req);
}

describe('client test', () => {
  test('should item create', () => {
    let state: TTest | null = null;

    const storasyClient = createStorasyClient();
    storasyClient.create<TTest>('test', INITIAL_ONE);
    expect(state).toBe(null);

    storasyClient.subscribe<TTest>('test', item => (state = item.state));

    expect(state).toBe(INITIAL_ONE);
  });

  test('should item change from put', () => {
    let state: TTest | null = null;
    const storasyClient = createStorasyClient();

    expect(state).toBe(null);

    storasyClient.subscribe<TTest>('test', item => (state = item.state));
    storasyClient.put<TTest>('test', INITIAL_ONE);

    expect(state).toBe(INITIAL_ONE);
  });

  test('should item change from controlled generator', async () => {
    let state: TTest | null = null;

    const storasyClient = createStorasyClient();
    storasyClient.create('controlledTest');
    expect(state).toBe(null);

    storasyClient.subscribe<TTest>('controlledTest', item => (state = item.state));
    expect(state).toBe(undefined);

    storasyClient.run('controlledTest', controlledGenerator);
    await new Promise(resolve => setTimeout(resolve));
    expect(state).toBe(INITIAL_ONE);
  });

  test('should item change from uncontrolled generator', async () => {
    let state: TTest | null = null;

    const storasyClient = createStorasyClient();
    storasyClient.create('uncontrolledTest');

    storasyClient.subscribe<TTest>('uncontrolledTest', item => (state = item.state));
    expect(state).toBe(undefined);

    storasyClient.run('uncontrolledTest', uncontrolledGenerator);
    await new Promise(resolve => setTimeout(resolve));

    expect(state).toBe(INITIAL_ONE);
  });
});
