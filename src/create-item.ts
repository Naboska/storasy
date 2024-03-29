import { createEvents } from './create-events';
import { isFn } from './helpers';
import type {
  TStorasyItemStatus,
  TStorasyItem,
  IStorasyItem,
  TStorasyItemEditState,
} from './types';

type TStorasyItemOptions<ItemState> = {
  initial?: ItemState;
};

export const createItem = <ItemState, AbortController = unknown>(
  options?: TStorasyItemOptions<ItemState>
): IStorasyItem<ItemState, AbortController> => {
  let state = options?.initial;
  let status: TStorasyItemStatus = 'stale';
  let error: string;
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
    get subscribersLength() {
      return subscribers.length;
    },
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
