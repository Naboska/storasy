import { createStorasyClient } from './create-storasy-client';
import { put } from './utils';

type TTest = {
  test: string;
};

const INITIAL_ONE = { test: 'test' };

function* testGenerator() {
  yield put('kek');
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

    storasyClient.subscribe<TTest>('test', item => (state = item.state));
    storasyClient.run('test', testGenerator);
  });
});
