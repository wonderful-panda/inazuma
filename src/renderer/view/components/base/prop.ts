import { Prop } from "vue/types/options";
type Supplier<T> = () => T;
type DefaultValue<T> = T | Supplier<T>;

export function required<T extends string = string>(
  type: typeof String
): { type: Supplier<T>; required: true };

export function required<T extends number = number>(
  type: typeof Number
): { type: Supplier<T>; required: true };

export function required<T extends (...args: any[]) => any = () => void>(
  type: typeof Function
): { type: Supplier<T>; required: true };

export function required<T extends ReadonlyArray<any>>(
  type: typeof Array
): { type: Supplier<T>; required: true };

export function required<T>(): { type: () => T; required: true };

export function required<T>(type: Prop<T>): { type: Supplier<T>; required: true };

export function required<T, U>(
  types: [Prop<T>, Prop<U>]
): { type: Supplier<T | U>; required: true };

export function required<T, U, V>(
  types: [Prop<T>, Prop<U>, Prop<V>]
): { type: Supplier<T | U | V>; required: true };

export function required(type?: any): any {
  return { type, required: true };
}

export function optional<T extends string = string>(
  type: typeof String
): { type: Supplier<T | undefined>; required: false };

export function optional<T extends number = number>(
  type: typeof Number
): { type: Supplier<T | undefined>; required: false };

export function optional<T extends (...args: any[]) => any = () => void>(
  type: typeof Function
): { type: Supplier<T | undefined>; required: false };

export function optional<T extends ReadonlyArray<any>>(
  type: typeof Array
): { type: Supplier<T | undefined>; required: false };

export function optional<T>(type: Prop<T>): { type: Supplier<T | undefined>; required: false };

export function optional<T>(): {
  type: Supplier<T | undefined>;
  required: false;
};

export function optional<T, U>(
  type: [Prop<T>, Prop<U>]
): { type: Supplier<T | U | undefined>; required: false };

export function optional<T, U, V>(
  type: [Prop<T>, Prop<U>, Prop<V>]
): { type: Supplier<T | U | V | undefined>; required: false };

export function optional(type?: any): any {
  return { type, required: false };
}

export function withDefault(
  type: typeof String,
  defaultValue: string
): { type: Supplier<string>; required: false; default: string };

export function withDefault<T extends string>(
  type: typeof String,
  defaultValue: T
): { type: Supplier<T>; required: false; default: T };

export function withDefault(
  type: typeof Number,
  defaultValue: number
): { type: Supplier<number>; required: false; default: number };

export function withDefault<T extends number>(
  type: typeof Number,
  defaultValue: T
): { type: Supplier<T>; required: false; default: T };

export function withDefault<T extends ReadonlyArray<any>>(
  type: typeof Array,
  defaultValue: Supplier<T>
): { type: Supplier<T>; required: false; default: Supplier<T> };

export function withDefault<T>(
  type: Prop<T>,
  defaultValue: DefaultValue<T>
): { type: Supplier<T>; required: false; default: DefaultValue<T> };

export function withDefault<T>(
  defaultValue: DefaultValue<T>
): { type: Supplier<T>; required: false; default: DefaultValue<T> };

export function withDefault<T, U>(
  type: [Prop<T>, Prop<U>],
  defaultValue: DefaultValue<T | U>
): { type: Supplier<T | U>; required: false };

export function withDefault<T, U, V>(
  type: [Prop<T>, Prop<U>, Prop<V>],
  defaultValue: DefaultValue<T | U | V>
): { type: Supplier<T | U | V>; required: false };

export function withDefault(...args: any[]): any {
  if (args.length === 1) {
    return { default: args[0] };
  } else {
    return { type: args[0], default: args[1] };
  }
}
