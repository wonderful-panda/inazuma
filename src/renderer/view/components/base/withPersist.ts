import Vue from "vue";

export type OwnMemberName<V extends typeof Vue> = Exclude<
  keyof InstanceType<V>,
  keyof Vue
>;

export function withPersist<V extends typeof Vue>(
  Base: V,
  keys: OwnMemberName<V>[],
  name: string
): V {
  return Base.extend({
    created() {
      this.$persist(keys as any, `persist:${name}`);
    }
  }) as V;
}
