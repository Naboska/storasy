import type { TMetaInfo, TStoryBuilderOptions, TStoryState, TSubscriber } from './types';
import { createStream } from './create-stream';

export const createStory = <State extends TStoryState = TStoryState>(
  storyBuilder: (options: TStoryBuilderOptions<State>) => void
) => {
  const stream = createStream();
  const _meta: Required<TMetaInfo<State>> = { name: '', initialState: <State>{} };

  const _copyState = (partial: Partial<State>) => ({ ...getState(), ...partial });
  const getState = () => _meta.initialState;

  const listen = (subscriber: TSubscriber<State>) =>
    stream.listen(state => {
      _meta.initialState = state;
      subscriber(state);
    });

  storyBuilder({
    constructor: fn => queueMicrotask(fn),
    on: stream.on,
    meta: _meta,
    getState,
    copyState: _copyState,
  });

  return {
    name: _meta.name,
    getState,
    listen,
    close: stream.stop,
    add: stream.add,
  };
};
