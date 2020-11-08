import { AsyncStore } from './async-store';

const storasy = new AsyncStore();

export const getItem = storasy.getItem.bind(storasy);
export const setItem = storasy.setItem.bind(storasy);
export const call = storasy.call.bind(storasy);
export const subscribe = storasy.subscribe.bind(storasy);
export const removeSubscriber = storasy.removeSubscriber.bind(storasy);
export const runner = storasy.runner.bind(storasy);
export const getAbortController = storasy.getAbortController.bind(storasy);
export const setAsyncEvents = storasy.setAsyncEvents.bind(storasy);
export const { asyncEvents } = storasy;
