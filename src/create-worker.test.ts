import { TStorasyFetcher } from './types';
import { call } from './utils';
import { getAbortControllerInstance } from './create-worker';

const response = { math: { PI: Math.PI } };

(global as any).fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve(response),
  })
);

const fetcher = ({ params: { url } }: TStorasyFetcher<{ url: string }>) =>
  fetch(url).then(r => r.json());

function* getMath() {
  yield call(fetcher);
}

beforeEach(() => {
  (fetch as any).mockClear();
});

describe('test worker', () => {
  test('should work correctly default abort controller', () => {
    const abortSpy = jest.spyOn(AbortController.prototype, 'abort');
    const { createAbortController, abort, getSignal } = getAbortControllerInstance();
    const controller = createAbortController();

    expect(getSignal(controller)).toEqual(controller.signal);

    abort(controller);
    expect(abortSpy).toBeCalledTimes(1);

    abortSpy.mockRestore();
  });

  test('', () => {});
});
