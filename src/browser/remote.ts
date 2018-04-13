import { config, environment } from "./persistent";

export function getPersistentAsJson(): string {
  return JSON.stringify({
    config: config.data,
    environment: environment.data
  });
}
