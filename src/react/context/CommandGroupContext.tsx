import { assertNever } from "@/util";
import { createContext, useEffect, useMemo, useReducer } from "react";

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

interface Command {
  name: string;
  hotkey?: HotKey;
  handler: () => void;
}
interface CommandGroup {
  groupName: string;
  commands: Command[];
}

interface State {
  groups: CommandGroup[];
}

type Action =
  | {
      type: "register";
      payload: CommandGroup;
    }
  | {
      type: "unregister";
      payload: string;
    };

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case "register":
      if (state.groups.find((g) => g.groupName === action.payload.groupName)) {
        console.error(`CommandGroup[${action.payload.groupName}] is already registered`);
        return state;
      }
      return { groups: [...state.groups, action.payload] };
    case "unregister":
      return { groups: state.groups.filter((g) => g.groupName !== action.payload) };
    default:
      return assertNever(action);
  }
};

const initialState: State = {
  groups: []
};

export interface CommandGroupMethods {
  register: (group: CommandGroup) => void;
  unregister: (groupName: string) => void;
}

export const CommandGroupContext = createContext({
  register: () => {},
  unregister: () => {}
} as CommandGroupMethods);

export const CommandGroupProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const methods = useMemo<CommandGroupMethods>(
    () => ({
      register: (group) => {
        dispatch({ type: "register", payload: group });
      },
      unregister: (groupName) => {
        dispatch({ type: "unregister", payload: groupName });
      }
    }),
    []
  );
  const hotkeyMap = useMemo<Record<string, Command>>(() => {
    const ret: Record<string, Command> = {};
    state.groups.forEach((g) =>
      g.commands.forEach((c) => {
        if (c.hotkey) {
          if (ret[c.hotkey]) {
            console.warn(`duplicated HotKey: [${c.hotkey}] ${ret[c.hotkey].name}, ${c.name}`);
          }
          ret[c.hotkey] = c;
        }
      })
    );
    return ret;
  }, [state.groups]);
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) {
        return;
      }
      const hotkey = getHotKeyString(e);
      const cmd = hotkeyMap[hotkey];
      if (cmd) {
        console.log(`run ${cmd.name}`);
        cmd.handler();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [hotkeyMap]);

  return <CommandGroupContext.Provider value={methods}>{children}</CommandGroupContext.Provider>;
};
