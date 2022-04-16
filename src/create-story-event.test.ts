import { createStoryEvent } from './create-story-event';

describe('create-story-event test', () => {
  test('should name be set', () => {
    const eventName = 'test';
    const testEvent = createStoryEvent(eventName);
    expect(testEvent.eventName).toBe(eventName);
  });

  test('should return event with name', () => {
    const eventName = 'test';
    const testEvent = createStoryEvent(eventName);

    expect(testEvent().eventName).toBe(eventName);
  });

  test('should return event with number args', () => {
    const eventName = 'test';
    const args = 1;
    const testEvent = createStoryEvent<number>(eventName);

    expect(testEvent(args).args).toBe(args);
  });

  test('should return event with string args', () => {
    const eventName = 'test';
    const args = 'test_args';
    const testEvent = createStoryEvent<string>(eventName);

    expect(testEvent(args).args).toBe(args);
  });

  test('should return event with array args', () => {
    const eventName = 'test';
    const args = [1, 2, 3, 4];
    const testEvent = createStoryEvent<number[]>(eventName);

    expect(testEvent(args).args).toBe(args);
  });

  test('should return event with object args', () => {
    const eventName = 'test';
    const args = { token: 'test' };
    const testEvent = createStoryEvent<{ token: string }>(eventName);

    expect(testEvent(args).args).toBe(args);
  });

  test('should return correct event', () => {
    type TStoryArgs = {
      token: string;
      data: { name: string; age: number };
    };

    const eventName = 'test';
    const args: TStoryArgs = { token: 'test', data: { name: 'Name', age: 21 } };
    const testEvent = createStoryEvent<TStoryArgs>(eventName);

    expect(testEvent(args)).toStrictEqual({ eventName, args });
  });
});
