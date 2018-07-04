import * as _ from "lodash";

export function createMixin<T extends object>(name: string, initialData: T) {
  // @vue/component
  return {
    data() {
      return {
        displayState: _.cloneDeep(initialData)
      };
    },
    watch: {
      displayState: {
        handler: _.debounce((value: any) => {
          localStorage.setItem(name, JSON.stringify(value));
        }, 500),
        deep: true
      }
    },
    mounted(this: { displayState: T }) {
      let storedData: T | undefined;
      const jsonString = localStorage.getItem(name);
      if (jsonString) {
        try {
          storedData = JSON.parse(jsonString);
        } catch (_) {
          // leave storedData undefined
          localStorage.removeItem(name);
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
      localStorage.setItem(name, JSON.stringify(currentData));
    }
  };
}
