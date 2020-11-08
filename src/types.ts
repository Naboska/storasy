export type TAsyncEvents = {
  controller: () => any;
  signal: (controller: any) => any;
  abort: (controller: any) => any;
};

export type TStoreItemData<T = any> = {
  data: T;
  isLoading: boolean;
  isError: boolean;
  error?: string;
  isLoaded: boolean;
};

export type TStoreItem<T = any> = {
  state: TStoreItemData<T>;
  subscribers: TStoreSubscriber[];
  abortController?: () => void;
};

export type TStoreSubscriber = (storeData: TStoreItemData) => void;

export type TStore = {
  [key: string]: TStoreItem;
};
