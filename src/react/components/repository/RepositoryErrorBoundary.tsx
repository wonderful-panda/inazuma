import { IconButton } from "@mui/material";
import { useCallback } from "react";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";
import { useAlert } from "@/context/AlertContext";
import { invokeTauriCommand } from "@/invokeTauriCommand";
import { Icon } from "../Icon";

const Fallback: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
  const alert = useAlert();
  const copyErrorMessage = useCallback(async () => {
    await invokeTauriCommand("yank_text", { text: error.message });
    alert.showSuccess("Error message has been copied to clipboard.");
  }, [error, alert]);
  return (
    <div className="grid grid-cols-[auto_60%_auto] w-full h-full">
      <div className="flex items-center col-start-2 m-auto p-4 w-max min-w-1/2 max-w-full bg-error shadow-2xl rounded overflow-hidden">
        <Icon className="text-4xl" icon="mdi:alert-circle-outline" />
        <pre className="flex-1 mx-4 leading-none whitespace-pre-wrap overflow-auto">
          {error.message}
        </pre>
        <IconButton onClick={copyErrorMessage}>
          <Icon className="text-2xl" icon="mdi:content-copy" />
        </IconButton>
        <IconButton onClick={resetErrorBoundary}>
          <Icon className="text-2xl" icon="mdi:refresh" />
        </IconButton>
      </div>
    </div>
  );
};
export const RepositoryErrorBoundary: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <ErrorBoundary FallbackComponent={Fallback}>{children}</ErrorBoundary>;
};

export const withRepositoryErrorBoundary = <P extends {}>(
  WrappedComponent: React.ComponentType<P>
) => {
  return (props: P) => (
    <RepositoryErrorBoundary>
      <WrappedComponent {...props} />
    </RepositoryErrorBoundary>
  );
};
