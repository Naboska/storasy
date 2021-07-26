import { call, go, put, select } from './utils';
import { createItem } from './create-item';
import { TAbortController, TStorasyItem } from './types';

const setup = <T = any>() => {
  const abortControllerInstance = jest.fn();

  const abortController: TAbortController<unknown> = {
    createAbortController: () => abortControllerInstance,
    abort: (controller: any) => controller('abort'),
    getSignal: (controller: any) => controller('signal'),
  };

  const storasyItem = createItem<T>();
  storasyItem.setAbortController(abortController.createAbortController());

  return {
    abortControllerInstance,
    abortController,
    storasyItem,
  };
};

describe('utils test', () => {
  test('should item selected', () => {
    const initialCount = 1;
    const storasyItem = createItem<number>(initialCount);
    const selectCountFromItem = select<number>();
    const count = selectCountFromItem(storasyItem);

    expect(count).toBe(initialCount);
    expect(storasyItem.getState()).toBe(initialCount);
  });

  test('should item changed', () => {
    const item: TStorasyItem<number> = {
      state: 2,
      status: 'loaded',
      error: 'errorText',
      isStale: false,
      isError: true,
      isLoaded: true,
      isLoading: false,
    };

    const storasyItem = createItem<number>(1);
    const putCountInItem = put<number>(curr => curr + 1, 'loaded', 'errorText');
    const itemAfterChange = putCountInItem(storasyItem);

    expect(itemAfterChange).toStrictEqual(item);
    expect(storasyItem.getItem()).toStrictEqual(item);
  });

  test('should item change status', () => {
    const storasyItem = createItem();

    const putStatusInItem = go('loading');
    const currentStatus = putStatusInItem(storasyItem);

    expect(currentStatus).toBe('loading');
    expect(storasyItem.getItem().isLoading).toBeTruthy();
  });

  test('should callFn get signal and use abort from abort controller', async () => {
    const resolveState = Math.PI;
    const { storasyItem, abortControllerInstance, abortController } = setup();

    const callPromise = call(() => Promise.resolve(resolveState));

    const result = await callPromise(storasyItem, abortController);

    expect(storasyItem.getState()).toBe(result);

    expect(abortControllerInstance.mock.calls).toEqual([['abort'], ['signal']]);
  });

  test('should callFn dont change state', async () => {
    const resolveState = Math.PI;
    const { storasyItem, abortController } = setup();

    const callPromise = call(() => Promise.resolve(resolveState), { isControl: true });

    const result = await callPromise(storasyItem, abortController);

    expect(storasyItem.getState()).not.toBe(result);
  });
});
