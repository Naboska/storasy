export type TAbortController<AbortController> = {
  createAbortController: () => AbortController;
  getSignal: (controller: AbortController) => any;
  abort: (controller: AbortController) => any;
  checkOnError: (error: Error) => boolean;
};

export type TStorasyClientOptions<AbortController> = {
  abortController?: TAbortController<AbortController>;
};

type TOnSubscribeCallback = () => void;

export type TStorasyClient = {
  get: <ItemState>(key: string) => IStorasyItem<ItemState> | null;
  create: <ItemState>(key: string, initial?: ItemState) => IStorasyItem<ItemState>;
  include: (key: string) => boolean;
  put: <ItemState>(key: string, data: ItemState | TStorasyItemEditState<ItemState>) => void;
  delete: (key: string) => boolean;
  run: <ItemState, Params = any>(
    key: string,
    generator: (params?: Params) => Generator<any>,
    options?: TStorasyRunOptions<Params>
  ) => TStorasyRunner;
  subscribe: <ItemState>(
    key: string,
    subscribe: TStorasyItemSubscribe<ItemState>
  ) => TOnSubscribeCallback;
};

export type TStorasyRunOptions<Params> = {
  enabled?: boolean;
  params?: Params;
};

export type TStorasyRunner<Params = any> = {
  refetch: (params?: Params) => void;
};

export type TStorasyFetcher<Params = unknown, Signal = AbortSignal> = {
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

export interface IStorasyItem<ItemState, AbortController = unknown> {
  subscribersLength: number;
  getItem: () => TStorasyItem<ItemState>;
  getState: () => ItemState;
  putState: (newState?: ItemState | TStorasyItemEditState<ItemState>) => ItemState | undefined;
  putStatus: (newStatus: Exclude<TStorasyItemStatus, 'stale'>) => TStorasyItemStatus;
  putItem: (
    newState: ItemState | TStorasyItemEditState<ItemState>,
    newStatus: Exclude<TStorasyItemStatus, 'stale'>,
    newError?: string
  ) => TStorasyItem<ItemState>;
  subscribe: (sub: TStorasyItemSubscribe<ItemState>) => TOnSubscribeCallback;
  getAbortController: () => AbortController | undefined;
  setAbortController: (newController: AbortController) => AbortController;
}
