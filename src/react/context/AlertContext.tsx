import Alert from "@/components/Alert";
import { assertNever } from "@/util";
import { createContext, useCallback, useMemo, useReducer } from "react";

export type AlertType = "info" | "success" | "warning" | "error";

interface State {
  open: boolean;
  type: AlertType;
  message: string;
}

type Action =
  | {
      type: "show";
      payload: { type: AlertType; message: string };
    }
  | {
      type: "hide";
    };

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case "show":
      return { open: true, ...action.payload };
    case "hide":
      return { ...state, open: false };
    default:
      return assertNever(action);
  }
};

const initialState: State = {
  open: false,
  type: "info",
  message: ""
};

export interface AlertHandler {
  show: (type: AlertType, message: string) => void;
  hide: () => void;
}

export const AlertContext = createContext({
  show: () => {},
  hide: () => {}
} as AlertHandler);

export const AlertProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const handler: AlertHandler = useMemo<AlertHandler>(
    () => ({
      show: (type, message) => {
        dispatch({ type: "hide" });
        setTimeout(() => {
          dispatch({ type: "show", payload: { type, message } });
        }, 100);
      },
      hide: () => {
        dispatch({ type: "hide" });
      }
    }),
    []
  );
  const handleClose = useCallback(() => {
    dispatch({ type: "hide" });
  }, []);

  return (
    <AlertContext.Provider value={handler}>
      {children}
      <Alert open={state.open} type={state.type} message={state.message} onClose={handleClose} />
    </AlertContext.Provider>
  );
};
