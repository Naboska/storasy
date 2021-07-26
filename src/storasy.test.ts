import { createStorasyClient } from './create-storasy-client';
import { call, put, go } from './utils';

type TTest = {
  test: string;
};

const INITIAL_ONE = { test: 'test' };

const fake_req = () => Promise.resolve(INITIAL_ONE);

function* testGenerator() {
  yield go('loading');
  const result: TTest = yield call(fake_req, { isControl: true });
  yield put<TTest>(result);
}

describe('client test', () => {
  test('item created', () => {
    let state: TTest | null = null;
    const storasyClient = createStorasyClient();

    expect(state).toBe(null);

    storasyClient.subscribe<TTest>('test', item => (state = item.state));
    storasyClient.put<TTest>('test', INITIAL_ONE);

    expect(state).toBe(INITIAL_ONE);
  });

  test('generator work', () => {
    let state: TTest | null = null;

    const storasyClient = createStorasyClient();

    storasyClient.create('test');
    storasyClient.subscribe<TTest>('test', item => (state = item.state));
    storasyClient.run('test', testGenerator);

    expect(state).toBe(INITIAL_ONE);
  });
});
