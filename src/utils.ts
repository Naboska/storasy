import type {
  TAbortController,
  IStorasyItem,
  TStorasyItemEditState,
  TStorasyItemStatus,
  TStorasyFetcher,
} from './types';

type TCall<Params> = {
  isControl?: boolean;
  params?: Params;
};

export const select = <ItemState>() => (item: IStorasyItem<ItemState>) => item.getState();

export const put = <ItemState>(
  data: ItemState | TStorasyItemEditState<ItemState>,
  status?: Exclude<TStorasyItemStatus, 'stale'>,
  error?: string
) => (item: IStorasyItem<ItemState>) => item.putItem(data, status ?? 'loaded', error);

export const go = <ItemState>(status: Exclude<TStorasyItemStatus, 'stale'>) => (
  item: IStorasyItem<ItemState>
) => item.putStatus(status);

export const call = <ItemState, Params>(
  promise: (params: TStorasyFetcher<Params>) => Promise<ItemState>,
  options?: TCall<Params>
) => (item: IStorasyItem<ItemState>, controller: TAbortController<AbortController>) => {
  const ac = item.getAbortController();

  if (ac) controller.abort(ac);

  const newAc = item.setAbortController(controller.createAbortController());

  if (!options?.isControl) item.putItem(item.getState(), 'loading', undefined);

  return promise({ signal: controller.getSignal(newAc), params: options?.params }).then(result => {
    if (!options?.isControl) item.putItem(result, 'loaded');
    return result;
  });
};
