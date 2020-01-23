import {
  InjectionKey,
  provide,
  inject,
  reactive,
  watch
} from "@vue/composition-api";

export type PartialStorage = Pick<Storage, "getItem" | "setItem">;

interface NamespacedStorage extends PartialStorage {
  readonly backend: Storage;
  readonly namespace: string;
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  subStorage(newNamespace: string): NamespacedStorage;
}

function createStorage(
  namespace: string,
  backend: Storage = localStorage
): NamespacedStorage {
  if (!namespace.endsWith("/")) {
    namespace += "/";
  }
  return {
    backend,
    namespace,
    getItem(key) {
      return backend.getItem(namespace + key);
    },
    setItem(key, value) {
      backend.setItem(namespace + key, value);
    },
    subStorage(newNamespace) {
      return createStorage(namespace + newNamespace, backend);
    }
  };
}

export const rootStorage = createStorage("", localStorage);

const injectKey: InjectionKey<NamespacedStorage> = Symbol(
  "namespaced storage key"
);

export function provideNamespacedStorage(value: NamespacedStorage) {
  provide(injectKey, value);
}

export function injectNamespacedStorage(): NamespacedStorage | void {
  return inject(injectKey);
}

export function useStorage<T extends object>(
  initialValue: T,
  storage: PartialStorage | void,
  storageKey: string
) {
  if (!storage) {
    return reactive(initialValue);
  }
  const storedString = storage.getItem(storageKey);
  let value: T;
  if (storedString) {
    try {
      value = { ...initialValue, ...JSON.parse(storedString) } as T;
    } catch (e) {
      console.warn("Failed to parse string from localStorage: " + storageKey);
      value = initialValue;
    }
  } else {
    value = initialValue;
  }
  const ret = reactive(value);
  watch(
    () => ret,
    value => {
      storage.setItem(storageKey, JSON.stringify(value));
    },
    { deep: true, lazy: true }
  );
  return ret;
}
