export type TAbortController<AbortController> = {
  createAbortController: () => AbortController;
  getSignal: (controller: AbortController) => any;
  abort: (controller: AbortController) => any;
};

export type TStorasyClient<AbortController> = {
  abortController?: TAbortController<AbortController>;
};

export type TStorasyRunOptions<Params> = {
  enabled?: boolean;
  params?: Params;
};

export type TStorasyFetcher<Params, Signal = AbortSignal> = {
  params: Params;
  signal: Signal;
};

export type TStorasyItemStatus = 'stale' | 'loading' | 'loaded';

export type TStorasyItem<T> = {
  state?: T;
  status: TStorasyItemStatus;
  error?: string;
  isLoaded: boolean;
  isLoading: boolean;
  isError: boolean;
  isStale: boolean;
};

export type TStorasyItemSubscribe<ItemState> = (item: TStorasyItem<ItemState>) => void;

export type TStorasyItemEditState<ItemState> = (
  oldState?: ItemState | undefined
) => ItemState | undefined;

export interface IStorasyItem<ItemState, GAbortController = AbortController> {
  getItem: () => TStorasyItem<ItemState>;
  getState: () => ItemState;
  putState: (newState?: ItemState | TStorasyItemEditState<ItemState>) => ItemState | undefined;
  putStatus: (newStatus: Exclude<TStorasyItemStatus, 'stale'>) => TStorasyItemStatus;
  putItem: (
    newState: ItemState | TStorasyItemEditState<ItemState>,
    newStatus: Exclude<TStorasyItemStatus, 'stale'>,
    newError?: string
  ) => TStorasyItem<ItemState>;
  subscribe: (sub: TStorasyItemSubscribe<ItemState>) => () => void;
  getAbortController: () => GAbortController | undefined;
  setAbortController: (newController: GAbortController) => GAbortController;
}
