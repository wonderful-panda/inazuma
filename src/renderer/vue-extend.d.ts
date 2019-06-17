import Vue from "vue";

declare module "vue/types/vue" {
  interface Vue {
    $persist(
      keys: (Exclude<keyof this, keyof Vue>)[],
      storeName?: string
    ): void;
  }
}
