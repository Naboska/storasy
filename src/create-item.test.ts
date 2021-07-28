import { createItem } from './create-item';
import { TStorasyItem, TStorasyItemStatus } from './types';

describe('item test', () => {
  test('should created initial item', () => {
    const item: TStorasyItem<null> = {
      state: null,
      status: 'stale',
      error: undefined,
      isStale: true,
      isError: false,
      isLoaded: false,
      isLoading: false,
    };

    const storasyItem = createItem({ initial: null });

    expect(storasyItem.getItem()).toStrictEqual(item);
  });

  test('should get correct subscribers length', () => {
    const item = createItem();
    expect(item.subscribersLength).toBe(0);

    const unsubscribe = item.subscribe(() => {});
    expect(item.subscribersLength).toBe(1);

    unsubscribe();
    expect(item.subscribersLength).toBe(0);
  });

  test('should created item with initial state', () => {
    const count = 1;
    const item = createItem({ initial: count });

    expect(item.getState()).toBe(count);
  });

  test('should change state', () => {
    const count = 1;
    const item = createItem({ initial: count });

    item.putState(count + 1);
    expect(item.getState()).toBe(2);

    item.putState(count => (count ?? 0) + 1);
    expect(item.getState()).toBe(3);
  });

  test('should change status', () => {
    const item = createItem();
    const newStatus: Exclude<TStorasyItemStatus, 'stale'> = 'loaded';

    item.putStatus(newStatus);
    expect(item.getItem().status).toBe(newStatus);
  });

  test('should change status, state, error', () => {
    const item: TStorasyItem<number> = {
      state: 1,
      status: 'loaded',
      error: 'errorText',
      isStale: false,
      isError: true,
      isLoaded: true,
      isLoading: false,
    };

    const storasyItem = createItem<number>({ initial: 0 });

    const newItem = storasyItem.putItem(oldState => oldState + 1, 'loaded', 'errorText');

    expect(newItem).toStrictEqual(item);
  });

  test('should subscriber get state after subscribe', () => {
    let localState;
    const storasyItem = createItem<number>({ initial: Math.PI });

    storasyItem.subscribe(item => (localState = item.state));

    expect(localState).toBe(Math.PI);
  });

  test('should get abort controller after set', () => {
    const storasyItem = createItem();

    expect(storasyItem.getAbortController()).toBeUndefined();

    const abortController = storasyItem.setAbortController(new AbortController());
    expect(storasyItem.getAbortController()).toBe(abortController);
  });
});
