import type { TMetaInfo, TStoryBuilderOptions, TSubscriber } from './types';
import { createStream } from './create-stream';
import { TStoryBuild } from './types';

export const createStory = <State = any>(
  builder: (options: TStoryBuilderOptions<State>) => void
) => {
  const stream = createStream();
  const _meta: Required<TMetaInfo<State>> = { name: '', state: <State>{} };
  let _build: TStoryBuild = null;

  builder({
    constructor: build => (_build = build),
    on: stream.on,
    meta: _meta,
    getState: () => _meta.state,
  });

  const listen = (subscriber: TSubscriber<State>) =>
    stream.listen(state => {
      _meta.state = state;
      subscriber(state);
    });

  _build?.();

  return {
    name: _meta.name,
    getState: () => _meta.state,
    listen,
    close: stream.stop,
    add: stream.add,
  };
};
