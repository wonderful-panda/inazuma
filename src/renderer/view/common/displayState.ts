import * as _ from "lodash";
export const dataStore: { [key: string]: any } = {};

export function initDataStore(data: { [key: string]: any }, prefix: string) {
  for (const key in data) {
    if (key.startsWith(prefix)) {
      dataStore[key] = _.cloneDeep(data[key]);
    }
  }
}

export function createMixin(name: string, memberName: string = "displayState") {
  return {
    created(this: any) {
      const storedData = dataStore[name];
      const currentData = this[memberName];
      if (storedData !== undefined) {
        for (const key in currentData) {
          const value = storedData[key];
          if (value !== undefined) {
            currentData[key] = value;
          }
        }
      }
      dataStore[name] = _.cloneDeep(currentData);
    },
    watch: {
      [memberName]: {
        handler(value: any) {
          dataStore[name] = _.cloneDeep(value);
        },
        deep: true
      }
    }
  };
}
