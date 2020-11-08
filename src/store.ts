import { TStore, TStoreSubscriber, TStoreItemData } from './types';
import { getInitialItem } from './utils';

export class Store {
  protected store: TStore = {};

  constructor() {
    this.notify = this.notify.bind(this);
    this.subscribe = this.subscribe.bind(this);
    this.removeSubscriber = this.removeSubscriber.bind(this);
    this.getItem = this.getItem.bind(this);
    this.setItem = this.setItem.bind(this);
    this.setItemError = this.setItemError.bind(this);
  }

  public notify(key: string) {
    const item = this.store[key];
    if (item) {
      const { subscribers, state } = item;
      subscribers.forEach(subscriber => subscriber(state));
    }
  }

  public subscribe(key: string, subscriber: TStoreSubscriber) {
    if (!this.store[key]) this.store[key] = getInitialItem();

    const isInclude = this.store[key].subscribers.includes(subscriber);
    if (!isInclude) this.store[key].subscribers.push(subscriber);

    subscriber(this.store[key].state);
  }

  public removeSubscriber(name: string, subscriber: TStoreSubscriber) {
    const item = this.store[name];
    const { subscribers } = item;
    const isNullSubscriber = subscribers.length <= 1;

    if (isNullSubscriber) delete this.store[name];
    else item.subscribers = subscribers.filter(sub => sub !== subscriber);
  }

  public getItem(key: string) {
    return this.store[key]?.state?.data;
  }

  public setItem<T = any, U = any>(key: string, callback: (data?: TStoreItemData<T>) => U) {
    this.store[key].state = {
      ...this.store[key].state,
      data: callback(this.getItem(key)),
      isLoading: false,
      isLoaded: this.store[key]?.state?.isLoaded || true,
    };
    this.notify(key);
  }

  protected setItemError(key: string, message: string) {
    this.store[key].state = {
      ...this.store[key].state,
      isError: true,
      error: message,
    };
  }
}
