import { isFn, isPromise } from './helpers';

const promise = Promise.resolve();
const fn = () => null;

describe('helpers test', () => {
  test('should check promise, true', () => {
    expect(isPromise(promise)).toBe(true);
  });

  test('should check promise, false', () => {
    expect(isPromise(fn)).toBeFalsy();
    expect(isPromise('text')).toBeFalsy();
    expect(isPromise(1)).toBeFalsy();
    expect(isPromise(NaN)).toBeFalsy();
    expect(isPromise(null)).toBeFalsy();
    expect(isPromise(undefined)).toBeFalsy();
  });

  test('should check function, true', () => {
    expect(isFn(fn)).toBe(true);
  });

  test('should check function, false', () => {
    expect(isFn(promise)).toBeFalsy();
    expect(isFn('text')).toBeFalsy();
    expect(isFn(1)).toBeFalsy();
    expect(isFn(NaN)).toBeFalsy();
    expect(isFn(null)).toBeFalsy();
    expect(isFn(undefined)).toBeFalsy();
  });
});
