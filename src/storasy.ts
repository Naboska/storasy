import { TAsyncEvents, TStore, TStoreItemData, TStoreSubscriber } from './types';
import { ABORT_CONTROLLER_MESSAGE } from './constants';
import { getInitialItem, isPromise } from './utils';

class Store {
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

  public setItem<R = any>(key: string, callback: <T>(data?: T) => R) {
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

class AsyncStore extends Store {
  private asyncEvents: TAsyncEvents = {
    controller: () => new AbortController(),
    signal: (controller: AbortController) => controller.signal,
    abort: (controller: AbortController) => controller.abort(),
  };

  constructor() {
    super();

    this.getAsyncEvents = this.getAsyncEvents.bind(this);
    this.setAsyncEvents = this.setAsyncEvents.bind(this);
    this.getAbortController = this.getAbortController.bind(this);
    this.call = this.call.bind(this);
    this.runner = this.runner.bind(this);
  }

  public setAsyncEvents(events: TAsyncEvents) {
    this.asyncEvents = events;
  }

  public getAsyncEvents(): TAsyncEvents {
    return this.asyncEvents;
  }

  public getAbortController(key: string) {
    return this.store[key].abortController;
  }

  private setAbortController(key: string, newController: () => void) {
    this.store[key].abortController = newController;
  }

  public call(key = 'string', promise: (...args: any[]) => Promise<any>, ...args: any[]) {
    const abortController = this.getAbortController(key);
    const { abort, controller, signal } = this.asyncEvents;

    if (abortController) abort(abortController);
    const newAbortController = controller();

    this.setAbortController(key, newAbortController);
    this.store[key].state = {
      ...this.store[key].state,
      isLoading: true,
      isError: false,
      error: undefined,
    };
    this.notify(key);

    return promise(...args, signal(newAbortController));
  }

  private createGeneratorError(
    key: string,
    generator: Generator<any>,
    error: Error & { status: string }
  ) {
    if (error.message === ABORT_CONTROLLER_MESSAGE) generator.return(error);
    else {
      this.setItemError(key, error.message);
      generator.throw(error);
    }
  }

  public runner(
    key: string,
    generator: Generator<any>,
    payload?: IteratorResult<any> | any[]
  ): any {
    const result = generator.next(payload);
    const action = result.value;
    const isProcessing = !result.done && Boolean(this.store[key]);

    if (isProcessing) {
      if (!isPromise(action)) return this.runner(key, generator, payload);

      return action.then(
        (payload: IteratorResult<any>) => this.runner(key, generator, payload),
        (error: Error & { status: string }) => this.createGeneratorError(key, generator, error)
      );
    }

    return 'final';
  }
}

const storasy = new AsyncStore();

export const {
  getItem,
  setItem,
  call,
  runner,
  subscribe,
  removeSubscriber,
  getAbortController,
  setAsyncEvents,
  getAsyncEvents,
} = storasy;

export default storasy;
