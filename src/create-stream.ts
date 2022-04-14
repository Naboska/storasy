import type { TGeneratorFn, TStoryEvent, TStoryEventBuilder, TGenerator } from './types';
import { isFn, isPromise } from './helpers';

export const createStream = () => {
  const _eventMap: Array<[TStoryEventBuilder, TGeneratorFn]> = [];
  const _stack: TGenerator[] = [];
  let _subscribers: Array<(value: any) => void> = [];
  let _isEnd = false;
  let _isProcessing = false;

  const _start = () => {
    _isEnd = false;
  };

  const stop = () => {
    _isEnd = true;
    if (_subscribers.length) _subscribers = [];
  };

  const on = (event: TStoryEventBuilder, callback: TGeneratorFn) => {
    _eventMap.push([event, callback]);
  };

  const listen = (listener: (value: any) => void) => {
    if (_isEnd) _start();
    _subscribers = [..._subscribers.filter(obs => obs !== listener), listener];

    return () => {
      _subscribers = _subscribers.filter(obs => obs !== listener);
      if (!_subscribers.length) stop();
    };
  };

  const add = (event: TStoryEvent) => {
    if (_isEnd) return;

    const foundedEvent = _eventMap.find(([{ eventName }]) => eventName === event.eventName);
    if (foundedEvent) _next(foundedEvent[1](...event.args));
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
    if (_isEnd) return _endTask();

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
    stop,
    listen,
    on,
    add,
  };
};
