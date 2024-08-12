import { useEffect, useState } from "react";
import { Loading } from "../Loading";

const preloadedFactory = <T,>(factory: () => T): (() => T) => {
  const value = factory();
  return () => value;
};

export const lazy = <P extends object>(
  factory: () => Promise<React.ComponentType<P>>,
  options?: { preload: boolean }
): React.ComponentType<P> => {
  const factory_ = options?.preload ? preloadedFactory(factory) : factory;
  const Lazy = (props: P) => {
    const [Component, setComponent] = useState<React.ComponentType<P> | undefined>(undefined);
    useEffect(() => {
      void factory_().then((value) => setComponent(() => value));
    }, []);
    if (Component) {
      return <Component {...props} />;
    } else {
      return <Loading open />;
    }
  };
  return Lazy;
};
