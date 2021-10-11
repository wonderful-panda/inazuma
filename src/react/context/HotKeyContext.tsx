import Alert from "@/components/Alert";
import { assertNever } from "@/util";
import { createContext, useCallback, useMemo, useReducer } from "react";

type Chars =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L"
  | "M"
  | "N"
  | "O"
  | "P"
  | "Q"
  | "R"
  | "S"
  | "T"
  | "U"
  | "V"
  | "W"
  | "X"
  | "Y"
  | "Z";

type FunctionKeys = `F${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12}`;
type OtherKeys =
  | "ArrowUp"
  | "ArrowDown"
  | "ArrowLeft"
  | "ArrowRight"
  | "Home"
  | "End"
  | "PageUp"
  | "PageDown"
  | "Tab"
  | "Enter"
  | "Delete"
  | "Insert"
  | "Backspace";

type Modifiers = `${"Control+" | ""}${"Alt+" | ""}${"Shift+" | ""}`;

export type HotKeys =
  | `${Modifiers}${FunctionKeys | OtherKeys}`
  | `${Exclude<Modifiers, "">}${Chars}`;

type Category = {
  category: string;
  handlers: Partial<Record<HotKeys, () => void>>;
};

interface State {
  categories: Category[];
}

type Action =
  | {
      type: "register";
      payload: { category: string; key: HotKeys; handler: () => void };
    }
  | {
      type: "unregister";
      payload: { category: string };
    };

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case "register":
      return { open: true, ...action.payload };
    case "unregister":
      return { ...state, open: false };
    default:
      return assertNever(action);
  }
};

const initialState: State = {
  categories: []
};

export interface HotKeyHandler {
  register: (category: string, hotkey: HotKeys, handler: () => void) => void;
  unregister: (category: string) => void;
  handleHotKey: (hotkey: HotKeys) => void;
}

export const HotKeyContext = createContext({
  register: () => {},
  unregister: () => {},
  handleHotKey: () => {}
} as HotKeyHandler);

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
