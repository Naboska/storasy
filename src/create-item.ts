import { createEvents } from './create-events';
import { isFn } from './helpers';
import type {
  TStorasyItemStatus,
  TStorasyItem,
  IStorasyItem,
  TStorasyItemEditState,
} from './types';

export const createItem = <ItemState, GAbortController = AbortController>(
  initial?: ItemState
): IStorasyItem<ItemState, GAbortController> => {
  let state = initial;
  let status: TStorasyItemStatus = 'stale';
  let error: string = undefined;
  let abortController: GAbortController;

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
    getItem: _getItem,
    getState: () => state,
    putState(newState) {
      state = _getNewState(newState);
      _notify();

      return state;
    },
    putStatus(newStatus) {
      status = newStatus;
      _notify();

      return status;
    },
    putItem(newState, newStatus, newError) {
      state = _getNewState(newState);
      status = newStatus;
      error = newError;
      _notify();

      return _getItem();
    },
    subscribe(sub) {
      sub(_getItem());

      return subscribers.push(sub);
    },
    getAbortController: () => abortController,
    setAbortController: newController => (abortController = newController),
  };
};
