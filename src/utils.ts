import type { ICreateItem, TEditState, TItemStatus } from './create-item';
import type { TAbortController } from './create-storasy-client';

type TCall = {
  isControl?: boolean;
  opt?: any;
};

type TCallPromise = {
  opt: any;
  signal: any;
};

export const select = <T>() => (item: ICreateItem<T>) => item.getState();

export const put = <T>(
  data: T | TEditState<T>,
  status?: Exclude<TItemStatus, 'stale'>,
  error?: string
) => (item: ICreateItem<T>) => item.putItem(data, status ?? 'loaded', error);

export const go = <T>(status: Exclude<TItemStatus, 'stale'>) => (item: ICreateItem<T>) =>
  item.putStatus(status);

export const call = <T>(promise: (opt: TCallPromise) => Promise<any>, options?: TCall) => (
  item: ICreateItem<T>,
  controller: TAbortController<AbortController>
) => {
  const ac = item.getAbortController();

  if (ac) controller.abort(ac);

  const newAc = item.setAbortController(controller.createAbortController());

  if (!options?.isControl) item.putItem(item.getState(), 'loading', undefined);

  return promise({ signal: controller.getSignal(newAc), opt: options?.opt }).then(result => {
    if (!options?.isControl) item.putItem(result, 'loaded');
    return result;
  });
};
