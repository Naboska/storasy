import type { TGeneratorFn, TStoryEvent, IStoryEventBuilder, TGenerator } from './types';
import { isFn, isPromise } from './helpers';

export const createStream = () => {
  const _eventMap: Array<[IStoryEventBuilder, TGeneratorFn]> = [];
  const _stack: TGenerator[] = [];
  let _subscribers: Array<(value: any) => void> = [];
  let _isProcessing = false;

  const stop = () => {
    _subscribers = [];
  };

  const on = (event: IStoryEventBuilder, callback: TGeneratorFn) => {
    _eventMap.push([event, callback]);
  };

  const listen = (listener: (value: any) => void) => {
    _subscribers = [..._subscribers.filter(obs => obs !== listener), listener];

    return () => {
      _subscribers = _subscribers.filter(obs => obs !== listener);
    };
  };

  const add = (event: TStoryEvent) => {
    const foundedEvent = _eventMap.find(([{ eventName }]) => eventName === event.eventName);
    if (foundedEvent) _next(foundedEvent[1](event.args));
  };

  const _next = (generator: Generator | AsyncGenerator) => {
    _stack.push(generator);
    _checkStack();
  };

  const _checkStack = () => {
    if (_stack.length && !_isProcessing) {
      const first = _stack.shift()!;
      _run(first).finally();
    }
  };

  const _startTask = () => {
    _isProcessing = true;
  };

  const _endTask = () => {
    _isProcessing = false;
    _checkStack();
  };

  const _broadcast = <T>(value: T) => {
    for (const subscriber of _subscribers) subscriber(value);
  };

  const _run = async (generator: Generator | AsyncGenerator): Promise<unknown> => {
    _startTask();

    const result = generator.next();
    const entry = isPromise(result) ? await result : result;

    if (!entry.done) {
      const output = isFn(entry.value) ? entry.value() : entry.value;

      if (isPromise(output))
        return output
          .then(payload => {
            _broadcast(payload);
            _run(generator);
          })
          .catch(error => {
            generator.throw(error);
          });

      _broadcast(output);
      return _run(generator);
    }

    _endTask();
  };

  return {
    listen,
    on,
    add,
    stop,
  };
};
