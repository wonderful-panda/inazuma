export function updater<T, K extends keyof T>(
  propName: string,
  obj: T,
  setterName: K
): Dict<Consumer<T[K]>> {
  const eventName = `update:${propName}`;
  return {
    [eventName]: (value: T[K]) => {
      obj[setterName] = value;
    }
  };
}
