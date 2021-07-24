type Events<T> = {
  length: number;
  push: (fn: T) => () => void;
  call: (arg: any) => void;
};

export const createEvents = <T extends (ars?: any) => void>(): Events<T> => {
  let handlers: T[] = [];

  return {
    get length() {
      return handlers.length;
    },
    push(fn: T) {
      handlers.push(fn);

      return () => {
        handlers = handlers.filter(handler => handler !== fn);
      };
    },
    call(arg) {
      handlers.forEach(fn => fn && fn(arg));
    },
  };
};
