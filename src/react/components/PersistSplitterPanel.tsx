import { usePersistState } from "@/hooks/usePersistState";
import { SplitterPanel, type SplitterPanelProps } from "./SplitterPanel";

export type PersistSplitterPanelProps = Omit<
  SplitterPanelProps,
  "ratio" | "direction" | "onUpdateRatio" | "onUpdateDirection"
> & {
  initialRatio: number;
  initialDirection: Direction;
  persistKey: string;
};

export const PersistSplitterPanel: React.FC<PersistSplitterPanelProps> = ({
  initialRatio,
  initialDirection,
  persistKey,
  allowDirectionChange,
  ...rest
}) => {
  const [ratio, setRatio] = usePersistState(`${persistKey}/splitter.ratio`, initialRatio);
  const [direction, setDirection] = usePersistState(
    `${persistKey}/splitter.direction`,
    initialDirection
  );
  return (
    <SplitterPanel
      {...rest}
      ratio={ratio}
      onUpdateRatio={setRatio}
      direction={allowDirectionChange ? direction : initialDirection}
      allowDirectionChange={allowDirectionChange}
      onUpdateDirection={allowDirectionChange ? setDirection : undefined}
    />
  );
};
