import classNames from "classnames";
import { Suspense } from "react";
import { Loading } from "../Loading";

export const LoadingSuspense: React.FC<React.PropsWithChildren<{ containerClass?: string }>> = ({
  children,
  containerClass
}) => {
  return (
    <div className={classNames("relative", containerClass)}>
      <Suspense fallback={<Loading open />}>{children}</Suspense>
    </div>
  );
};

export const withLoadingSuspense = <P extends {}>(
  WrappedComponent: React.ComponentType<P>,
  containerClass?: string
) => {
  return (props: P) => (
    <LoadingSuspense containerClass={containerClass}>
      <WrappedComponent {...props} />
    </LoadingSuspense>
  );
};
