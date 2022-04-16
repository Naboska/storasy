import type { TMetaInfo, TStoryBuilderOptions, TSubscriber } from './types';
import { createStream } from './create-stream';
import { TStoryBuild } from './types';
import * as typeError from './constants';

export const createStory = <State = any>(
  builder: (options: TStoryBuilderOptions<State>) => void
) => {
  const stream = createStream();
  const _meta: Required<TMetaInfo<State>> = { name: null, state: <State>{} };
  let _build: TStoryBuild = null;

  if (!builder) throw typeError.STORASY_BUILDER_ERROR;

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

  if (_build) _build();
  else throw typeError.STORASY_CONSTRUCTOR_ERROR;

  if (!_meta.name) throw typeError.STORASY_NULL_NAME_ERROR;

  return {
    name: _meta.name,
    getState: () => _meta.state,
    listen,
    close: stream.stop,
    add: stream.add,
  };
};
