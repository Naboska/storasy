import type { IStoryEventBuilder } from './types';

export const createStoryEvent = <Args = never>(eventName: string): IStoryEventBuilder<Args> => {
  const eventFn = (args?: Args) => ({ eventName, args });
  eventFn.eventName = eventName;

  return eventFn;
};
