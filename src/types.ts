export type TStoryEvent = {
  eventName: string;
  args: any[];
};

export type TStoryEventBuilder = ((...args: any[]) => any) & { eventName: string };

export type TGenerator = Generator | AsyncGenerator;

export type TGeneratorFn = (params?: any[]) => TGenerator;

export type TStoryState = Record<string, unknown>;

export type TMetaInfo<State extends TStoryState> = { name?: string; initialState?: State };

export type TSubscriber<State extends TStoryState> = (state: State) => void;

export type TStoryBuilderOptions<State extends TStoryState = TStoryState> = {
  constructor: (initFn: () => void) => void;
  meta: TMetaInfo<State>;
  on: (event: TStoryEventBuilder, callback: TGeneratorFn) => void;
  getState: () => State;
  copyState: (partial: Partial<State>) => void;
};
