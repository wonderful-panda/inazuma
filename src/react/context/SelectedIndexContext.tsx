import { createContext, useMemo, useState } from "react";

export const SelectedIndexContext = createContext<number>(-1);

export interface SelectedIndexHandler {
  set: React.Dispatch<React.SetStateAction<number>>;
  moveNext: () => void;
  movePrevious: () => void;
  moveFirst: () => void;
  moveLast: () => void;
}

export const SetSelectedIndexContext = createContext<SelectedIndexHandler>({
  set: () => {},
  moveNext: () => {},
  movePrevious: () => {},
  moveFirst: () => {},
  moveLast: () => {}
});

const createHandler = (
  itemsCount: number,
  setter: React.Dispatch<React.SetStateAction<number>>
): SelectedIndexHandler => {
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
    [itemsCount]
  );
};

export const SelectedIndexProvider: React.FC<{ itemsCount: number; initialValue?: number }> = ({
  itemsCount,
  initialValue = -1,
  children
}) => {
  const [selectedIndex, setSelectedIndex] = useState(initialValue);
  const handler = createHandler(itemsCount, setSelectedIndex);
  return (
    <SelectedIndexContext.Provider value={selectedIndex}>
      <SetSelectedIndexContext.Provider value={handler}>
        {children}
      </SetSelectedIndexContext.Provider>
    </SelectedIndexContext.Provider>
  );
};

export const CustomSelectedIndexProvider: React.FC<{
  itemsCount: number;
  value: number;
  setValue: React.Dispatch<React.SetStateAction<number>>;
}> = ({ itemsCount, value, setValue, children }) => {
  const handler = createHandler(itemsCount, setValue);
  return (
    <SelectedIndexContext.Provider value={value}>
      <SetSelectedIndexContext.Provider value={handler}>
        {children}
      </SetSelectedIndexContext.Provider>
    </SelectedIndexContext.Provider>
  );
};
