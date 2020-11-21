import { VueConstructor } from "vue";

export function asAsyncComponent<C extends VueConstructor>(factory: () => Promise<C>): C {
  return (factory as any) as C;
}
