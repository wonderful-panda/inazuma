import Vue from "vue";
import * as _ from "lodash";
import { VueConstructor } from "vue/types/vue";

type Storage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};
function getDebouncedStorage(storage: Storage, wait: number): Storage {
  let cache = {} as Record<string, string>;
  const save = _.debounce(() => {
    for (const key in cache) {
      storage.setItem(key, cache[key]);
    }
    cache = {};
  }, wait);
  return {
    getItem(key) {
      return cache[key] || storage.getItem(key);
    },
    setItem(key, value) {
      cache[key] = value;
      save();
    },
    removeItem(key) {
      if (key in cache) {
        delete cache[key];
      }
      storage.removeItem(key);
    }
  };
}

const debouncedLocalStorage = getDebouncedStorage(localStorage, 500);

export type MixinOptions = {
  key: string;
  root?: boolean;
};

function getFullname(namespace: string, options: MixinOptions): string {
  if (namespace.length === 0 || options.root) {
    return "displayState://" + options.key;
  } else {
    return namespace + options.key;
  }
}

type Injected = Vue & {
  $$displayStateNamespace: string;
};
const InjectedVue = Vue as VueConstructor<Injected>;

export function createMixin<T extends object>(
  initialData: T,
  options: MixinOptions
) {
  return InjectedVue.extend({
    inject: {
      $$displayStateNamespace: { default: "" }
    },
    provide(this: Injected) {
      return {
        $$displayStateNamespace:
          getFullname(this.$$displayStateNamespace, options) + "/"
      };
    },
    data() {
      return {
        displayState: _.cloneDeep(initialData)
      };
    },
    watch: {
      displayState: {
        handler(value: any) {
          const fullname = getFullname(this.$$displayStateNamespace, options);
          debouncedLocalStorage.setItem(fullname, JSON.stringify(value));
        },
        deep: true
      }
    },
    mounted() {
      const fullname = getFullname(this.$$displayStateNamespace, options);
      let storedData: T | undefined;
      const jsonString = debouncedLocalStorage.getItem(fullname);
      if (jsonString) {
        try {
          storedData = JSON.parse(jsonString);
        } catch (_) {
          // leave storedData undefined
          debouncedLocalStorage.removeItem(name);
        }
      }
      const currentData = this.displayState;
      if (storedData !== undefined) {
        for (const key in currentData) {
          const value = storedData[key];
          if (value !== undefined) {
            currentData[key] = value;
          }
        }
      }
      debouncedLocalStorage.setItem(name, JSON.stringify(currentData));
    }
  });
}
