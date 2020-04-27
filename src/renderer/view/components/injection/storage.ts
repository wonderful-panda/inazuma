import {
  InjectionKey,
  inject,
  provide,
  reactive,
  watch
} from "@vue/composition-api";

export type StorageWithNamespace = {
  storage: Storage | null;
  namespace: string;
};

const key: InjectionKey<StorageWithNamespace> = Symbol(
  "inazuma.vue.injection.StorageWithNamespace"
);

export function provideStorage(storage: StorageWithNamespace) {
  provide(key, storage);
}

export function injectStorage(): StorageWithNamespace {
  return inject(key) || { storage: null, namespace: "" };
}

export function provideStorageWithAdditionalNamespace(
  suffix: string,
  current?: StorageWithNamespace
) {
  const { storage, namespace } = current || injectStorage();
  const newValue = {
    storage,
    namespace: `${namespace}/${suffix}`
  };
  provide(key, newValue);
}

export function useStorage<T extends object>(
  initialValue: T,
  { storage, namespace }: StorageWithNamespace,
  storageKey: string
) {
  if (!storage) {
    return reactive(initialValue);
  }
  const key = `${namespace}/${storageKey}`;
  const storedString = storage.getItem(key);
  let value: T;
  if (storedString) {
    try {
      value = { ...initialValue, ...JSON.parse(storedString) } as T;
    } catch (e) {
      console.warn("Failed to parse string from storage: " + storageKey);
      value = initialValue;
    }
  } else {
    value = initialValue;
  }
  const ret = reactive(value);
  watch(
    () => ret,
    value => {
      storage.setItem(key, JSON.stringify(value));
    },
    { deep: true, lazy: true }
  );
  return ret;
}
