import * as _ from "lodash";
export const dataStore = Object.create({});

export function initDataStore(data: { [key: string]: any }) {
  const clone = _.cloneDeep(data);
  for (const key in clone) {
    dataStore[key] = clone[key];
  }
}

export function createMixin<T>(name: string, initialData: T) {
  // @vue/component
  return {
    data() {
      return {
        displayState: _.cloneDeep(initialData)
      };
    },
    watch: {
      displayState: {
        handler(value: any) {
          dataStore[name] = _.cloneDeep(value);
        },
        deep: true
      }
    },
    created(this: { displayState: T }) {
      const storedData = dataStore[name];
      const currentData = this.displayState;
      if (storedData !== undefined) {
        for (const key in currentData) {
          const value = storedData[key];
          if (value !== undefined) {
            currentData[key] = value;
          }
        }
      }
      dataStore[name] = _.cloneDeep(currentData);
    }
  };
}
