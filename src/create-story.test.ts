import { createStory } from './create-story';
import { createStoryEvent } from './create-story-event';

const setup = (initialValue = 0) => {
  const incrementEvent = createStoryEvent('increment');
  const decrementEvent = createStoryEvent('decrement');
  const setEvent = createStoryEvent<number>('set');

  const story = createStory<number>(({ constructor, on, getState, meta }) => {
    constructor(() => {
      meta.name = 'increment-story';
      meta.state = initialValue;

      on(incrementEvent, handleIncrement);
      on(decrementEvent, handleDecrement);
      on(setEvent, handleSet);
    });

    function* handleIncrement() {
      yield getState() + 1;
    }

    function* handleDecrement() {
      yield getState() - 1;
    }

    function* handleSet(value: number) {
      yield value;
    }
  });

  return {
    story,
    incrementEvent,
    decrementEvent,
    setEvent,
  };
};

describe('create-story test', () => {
  test('should name be set', () => {
    const { story } = setup();
    expect(story.name).toBe('increment-story');
  });

  test('should initial value be set', () => {
    const initial = 1_000_000;
    const { story } = setup(initial);
    expect(story.getState()).toBe(initial);
  });

  test('should increment value', () => {
    const initial = 1_000_000 * 133;
    const { story, incrementEvent } = setup(initial);
    let state = story.getState();

    const unsubscribe = story.listen(value => (state = value));

    story.add(incrementEvent());

    expect(state).toBe(initial + 1);

    unsubscribe();
  });

  test('should decrement value', () => {
    const initial = 1_000_000 * 331;
    const { story, decrementEvent } = setup(initial);
    let state = story.getState();

    const unsubscribe = story.listen(value => (state = value));

    story.add(decrementEvent());

    expect(state).toBe(initial - 1);

    unsubscribe();
  });

  test('should set value', () => {
    const initial = 3_000_000;
    const next = 1_000_000;
    const { story, setEvent } = setup(initial);
    let state = story.getState();

    const unsubscribe = story.listen(value => (state = value));

    story.add(setEvent(next));

    expect(state).toBe(next);

    unsubscribe();
  });
});
