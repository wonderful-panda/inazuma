import { createContext, useMemo, useState } from "react";

export const SelectedIndexContext = createContext<number>(-1);

export interface SelectedIndexMethods {
  set: React.Dispatch<React.SetStateAction<number>>;
  moveNext: () => void;
  movePrevious: () => void;
  moveFirst: () => void;
  moveLast: () => void;
}

export const SelectedIndexMethodsContext = createContext<SelectedIndexMethods>({
  set: () => {},
  moveNext: () => {},
  movePrevious: () => {},
  moveFirst: () => {},
  moveLast: () => {}
});

const useMethods = (
  itemsCount: number,
  setter: React.Dispatch<React.SetStateAction<number>>
): SelectedIndexMethods => {
  return useMemo(
    () => ({
      set: setter,
      moveNext: () => {
        if (0 < itemsCount) {
          setter((cur) => (cur < itemsCount - 1 ? cur + 1 : itemsCount - 1));
        }
      },
      movePrevious: () => {
        if (0 < itemsCount) {
          setter((cur) => (1 <= cur ? cur - 1 : 0));
        }
      },
      moveFirst: () => {
        if (0 < itemsCount) {
          setter(0);
        }
      },
      moveLast: () => {
        if (0 < itemsCount) {
          setter(itemsCount - 1);
        }
      }
    }),
    [itemsCount, setter]
  );
};

export const SelectedIndexProvider: React.FC<{ itemsCount: number; initialValue?: number }> = ({
  itemsCount,
  initialValue = -1,
  children
}) => {
  const [selectedIndex, setSelectedIndex] = useState(initialValue);
  const methods = useMethods(itemsCount, setSelectedIndex);
  return (
    <SelectedIndexContext.Provider value={selectedIndex}>
      <SelectedIndexMethodsContext.Provider value={methods}>
        {children}
      </SelectedIndexMethodsContext.Provider>
    </SelectedIndexContext.Provider>
  );
};

export const CustomSelectedIndexProvider: React.FC<{
  itemsCount: number;
  value: number;
  setValue: React.Dispatch<React.SetStateAction<number>>;
}> = ({ itemsCount, value, setValue, children }) => {
  const handler = useMethods(itemsCount, setValue);
  return (
    <SelectedIndexContext.Provider value={value}>
      <SelectedIndexMethodsContext.Provider value={handler}>
        {children}
      </SelectedIndexMethodsContext.Provider>
    </SelectedIndexContext.Provider>
  );
};
