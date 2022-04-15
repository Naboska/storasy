export type TStoryEvent<Args = any> = { eventName: string; args: Args };

export interface IStoryEventBuilder<Args = any> {
  (args?: Args): TStoryEvent<Args>;
  eventName: string;
}

export type TGenerator = Generator | AsyncGenerator;

export type TGeneratorFn = (args: any) => TGenerator;

export type TMetaInfo<State = any> = { name?: string; state?: State };

export type TSubscriber<State = any> = (state: State) => void;

export type TStoryBuilderOptions<State = any> = {
  constructor: (initFn: () => void) => void;
  meta: TMetaInfo<State>;
  on: (event: IStoryEventBuilder, callback: TGeneratorFn) => void;
  getState: () => State;
};

export type TStoryBuild = (() => void) | null;
