import { createEvents } from './create-events';

describe('events test', () => {
  test('should subscriber pushed', () => {
    const events = createEvents();

    const subscriber = () => {};
    events.push(subscriber);

    expect(events.length).toBe(1);
  });

  test('should subscriber deleted', () => {
    const events = createEvents();

    const unsubscribe = events.push(() => {});
    expect(events.length).toBe(1);

    unsubscribe();
    expect(events.length).toBe(0);
  });

  test('should subscriber notified', () => {
    const subscriber = jest.fn();
    const events = createEvents();
    const count = 1;

    events.push(subscriber);
    events.call(count);

    expect(subscriber.mock.calls[0][0]).toBe(count);
  });
});
