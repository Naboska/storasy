import type { TStoryEventBuilder } from './types';

export const createStoryEvent = (eventName: string): TStoryEventBuilder => {
  const eventFn = (...args: any[]) => ({ eventName, args });
  eventFn.eventName = eventName;

  return eventFn;
};
