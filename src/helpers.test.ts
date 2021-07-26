import { isFn, isPromise } from './helpers';

const promise = Promise.resolve();
const fn = () => null;

describe('helpers test', () => {
  test('should check promise, true', () => {
    expect(isPromise(promise)).toBe(true);
  });
  test('should check promise, false', () => {
    expect(isPromise(fn)).toBe(false);
    expect(isPromise('text')).toBe(false);
    expect(isPromise(1)).toBe(false);
    expect(isPromise(NaN)).toBe(false);
    expect(isPromise(null)).toBe(false);
    expect(isPromise(undefined)).toBe(false);
  });
  test('should check function, true', () => {
    expect(isFn(fn)).toBe(true);
  });
  test('should check function, false', () => {
    expect(isFn(promise)).toBe(false);
    expect(isFn('text')).toBe(false);
    expect(isFn(1)).toBe(false);
    expect(isFn(NaN)).toBe(false);
    expect(isFn(null)).toBe(false);
    expect(isFn(undefined)).toBe(false);
  });
});
