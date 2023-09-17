import { assertNever } from "@/util";
import { createContext, useContext, useEffect, useMemo, useReducer } from "react";

// prettier-ignore
type Char =
  | "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M" | "N"
  | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "W" | "X" | "Y" | "Z"
  | "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

type FKey = `F${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12}`;

// prettier-ignore
type OtherKey =
  | "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight"
  | "Home" | "End" | "PageUp" | "PageDown"
  | "Enter" | "Tab" | "Insert" | "Delete" | "Space" | "Backspace";

const codeToKey = (code: string): string => {
  if (code.startsWith("Key")) {
    return code.substr(3);
  } else if (code.startsWith("Digit")) {
    return code.substr(5);
  } else {
    return code;
  }
};

const getHotKeyString = (e: KeyboardEvent): string => {
  const ctrl = e.ctrlKey ? "Ctrl+" : "";
  const alt = e.altKey ? "Alt+" : "";
  const shift = e.shiftKey ? "Shift+" : "";
  const key = codeToKey(e.code);
  return ctrl + alt + shift + key;
};

type Modifier = `${"Ctrl+" | ""}${"Alt+" | ""}${"Shift+" | ""}`;

export type HotKey = `${Exclude<Modifier, "Shift+" | "">}${Char | OtherKey}` | `${Modifier}${FKey}`;

export interface Command {
  name: string;
  hotkey?: HotKey;
  handler: () => void;
}
interface CommandGroup {
  groupName: string;
  commands: readonly Command[];
}

interface State {
  groups: readonly CommandGroup[];
  suspend: number;
}

type Action =
  | {
      type: "register";
      payload: CommandGroup;
    }
  | {
      type: "unregister";
      payload: string;
    }
  | {
      type: "suspend" | "resume";
    };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "register":
      if (state.groups.find((g) => g.groupName === action.payload.groupName)) {
        console.error(`CommandGroup[${action.payload.groupName}] is already registered`);
        return state;
      }
      return { ...state, groups: [...state.groups, action.payload] };
    case "unregister":
      return { ...state, groups: state.groups.filter((g) => g.groupName !== action.payload) };
    case "suspend":
      return { ...state, suspend: state.suspend + 1 };
    case "resume":
      return { ...state, suspend: state.suspend - 1 };
    default:
      return assertNever(action);
  }
};

const initialState: State = {
  groups: [],
  suspend: 0
};

export interface CommandGroupMethods {
  register: (group: CommandGroup) => void;
  unregister: (groupName: string) => void;
  suspend: () => void;
  resume: () => void;
}

export const CommandGroupContext = createContext({
  register: () => {},
  unregister: () => {},
  suspend: () => {},
  resume: () => {}
} as CommandGroupMethods);

const CommandGroupTreeContext = createContext({
  path: "/root",
  enabled: true
});

export const CommandGroupTreeProvider: React.FC<
  { name: string; enabled: boolean } & ChildrenProp
> = ({ name, enabled, children }) => {
  const parentContext = useContext(CommandGroupTreeContext);
  const path = `${parentContext.path}/${name}`;
  const actuallyEnabled = parentContext.enabled && enabled;
  const state = useMemo(
    () => ({
      path,
      enabled: actuallyEnabled
    }),
    [path, actuallyEnabled]
  );
  return (
    <CommandGroupTreeContext.Provider value={state}>{children}</CommandGroupTreeContext.Provider>
  );
};

export const useCommandGroupTree = () => useContext(CommandGroupTreeContext);

export const CommandGroupProvider: React.FC<ChildrenProp> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const methods = useMemo<CommandGroupMethods>(
    () => ({
      register: (group) => {
        dispatch({ type: "register", payload: group });
      },
      unregister: (groupName) => {
        dispatch({ type: "unregister", payload: groupName });
      },
      suspend: () => dispatch({ type: "suspend" }),
      resume: () => dispatch({ type: "resume" })
    }),
    []
  );
  const hotkeyMap = useMemo<Record<string, { cmd: Command; group: string }>>(() => {
    const ret: Record<string, { cmd: Command; group: string }> = {};
    state.groups.forEach((g) =>
      g.commands.forEach((c) => {
        if (c.hotkey) {
          if (ret[c.hotkey]) {
            console.warn(`duplicated HotKey: [${c.hotkey}] ${ret[c.hotkey].cmd.name}, ${c.name}`);
          }
          ret[c.hotkey] = { cmd: c, group: g.groupName };
        }
      })
    );
    return ret;
  }, [state.groups]);
  const suspended = state.suspend > 0;
  useEffect(() => {
    if (suspended) {
      return;
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) {
        return;
      }
      const hotkey = getHotKeyString(e);
      const c = hotkeyMap[hotkey];
      if (c) {
        e.preventDefault();
        console.log(`run ${c.cmd.name}, ${c.group}`);
        c.cmd.handler();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [hotkeyMap, suspended]);

  return <CommandGroupContext.Provider value={methods}>{children}</CommandGroupContext.Provider>;
};
