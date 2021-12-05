import React, { useEffect, useState } from "react";
import { Loading } from "../Loading";

const preloadedFactory = <T extends unknown>(factory: () => T): (() => T) => {
  const value = factory();
  return () => value;
};

export const lazy = <P extends {}>(
  factory: () => Promise<{ default: React.ComponentType<P> }>,
  options?: { preload: boolean }
): React.ComponentType<P> => {
  const factory_ = options?.preload ? preloadedFactory(factory) : factory;
  const Lazy = (props: P) => {
    const [Component, setComponent] = useState<React.ComponentType<P> | undefined>(undefined);
    useEffect(() => {
      factory_().then((value) => setComponent(() => value.default));
    }, []);
    if (Component) {
      return <Component {...props} />;
    } else {
      return <Loading open />;
    }
  };
  return Lazy;
};
