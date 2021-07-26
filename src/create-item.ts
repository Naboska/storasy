import { createEvents } from './create-events';
import { isFn } from './helpers';
import type {
  TStorasyItemStatus,
  TStorasyItem,
  IStorasyItem,
  TStorasyItemEditState,
} from './types';

export const createItem = <ItemState, AbortController>(
  initial?: ItemState
): IStorasyItem<ItemState, AbortController> => {
  let state = initial;
  let status: TStorasyItemStatus = 'stale';
  let error: string = undefined;
  let abortController: AbortController;

  const subscribers = createEvents<(state: TStorasyItem<ItemState>) => void>();

  const _notify = () => subscribers.call(_getItem());

  const _getItem = () => ({
    state,
    status,
    error,
    isLoaded: status === 'loaded',
    isLoading: status === 'loading',
    isError: Boolean(error),
    isStale: status === 'stale',
  });

  const _getNewState = (newState: TStorasyItemEditState<ItemState> | ItemState): ItemState =>
    isFn(newState)
      ? (newState as TStorasyItemEditState<ItemState>)(state)
      : (newState as ItemState);

  return {
    getState: () => state,
    putState(newState) {
      state = _getNewState(newState);
      _notify();
    },
    putStatus(newStatus) {
      status = newStatus;
      _notify();
    },
    putItem(newState, newStatus, newError) {
      state = _getNewState(newState);
      status = newStatus;
      error = newError;
      _notify();
    },
    subscribe(sub) {
      sub(_getItem());
      return subscribers.push(sub);
    },
    getAbortController: () => abortController,
    setAbortController: newController => (abortController = newController),
  };
};
