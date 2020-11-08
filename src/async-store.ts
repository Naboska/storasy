import { Store } from './store';
import { TAsyncEvents } from './types';
import { isPromise } from './utils';

export class AsyncStore extends Store {
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
    if (error.status === 'cancelled') generator.return(error);
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
