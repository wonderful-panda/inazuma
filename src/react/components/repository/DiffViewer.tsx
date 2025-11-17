import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import type * as monaco from "monaco-editor";
import { memo, useMemo } from "react";
import { getLangIdFromPath, setup as setupMonaco } from "@/monaco";
import { Icon } from "../Icon";
import { type DiffContent, MonacoDiffEditor } from "../MonacoDiffEditor";

setupMonaco();

const diffViewerViewTypeValues = ["sidebyside", "inline"] as const;
export type DiffViewerViewType = (typeof diffViewerViewTypeValues)[number];
export const fixView = (value?: string): DiffViewerViewType =>
  diffViewerViewTypeValues.find((v) => v === value) || "sidebyside";

type IDiffEditorConstructionOptions = monaco.editor.IDiffEditorConstructionOptions;

export interface DiffViewerOptions {
  view?: DiffViewerViewType;
  hideUnchangedRegions?: boolean;
}

export interface DiffViewerProps {
  options?: DiffViewerOptions;
  onOptionsChange?: (value: DiffViewerOptions) => void;
  left?: TextFile;
  right?: TextFile;
}

const baseOptions: IDiffEditorConstructionOptions = {
  readOnly: true,
  originalEditable: false,
  folding: false,
  minimap: { enabled: false },
  contextmenu: false,
  useInlineViewWhenSpaceIsLimited: false
};

const useDiffContent = (tf: TextFile | undefined) =>
  useMemo<DiffContent | undefined>(
    () =>
      tf
        ? {
            content: tf.content,
            language: getLangIdFromPath(tf.path)
          }
        : undefined,
    [tf]
  );

const DiffViewer_: React.FC<DiffViewerProps> = ({ options, onOptionsChange, left, right }) => {
  const leftContent = useDiffContent(left);
  const rightContent = useDiffContent(right);

  const fullOptions = useMemo<IDiffEditorConstructionOptions>(
    () => ({
      ...baseOptions,
      renderSideBySide: fixView(options?.view) === "sidebyside",
      hideUnchangedRegions: { enabled: options?.hideUnchangedRegions }
    }),
    [options]
  );
  const flags = useMemo(
    () => (options?.hideUnchangedRegions ? ["fold"] : []),
    [options?.hideUnchangedRegions]
  );

  const handleViewChange = useMemo(() => {
    if (onOptionsChange === undefined) {
      return undefined;
    }
    return (_: React.MouseEvent, value: DiffViewerViewType) =>
      onOptionsChange({ ...options, view: value });
  }, [onOptionsChange, options]);

  const handleFlagsChange = useMemo(() => {
    if (onOptionsChange === undefined) {
      return undefined;
    }
    return (_: React.MouseEvent, value: string[]) => {
      const newOptions = { ...options, hideUnchangedRegions: value.includes("fold") };
      console.log("handleFlagsChange:", value, newOptions);
      onOptionsChange(newOptions);
    };
  }, [onOptionsChange, options]);
  return (
    <div className="grid grid-rows-[max-content_1fr] grid-col-1 gap-2 flex-1 overflow-hidden border border-paper p-2">
      <div className="flex-row-norap">
        <ToggleButtonGroup
          value={fixView(options?.view)}
          exclusive
          size="small"
          className="mx-2"
          onChange={handleViewChange}
        >
          <ToggleButton value="sidebyside" title="Side by side view">
            <Icon icon="octicon:split-view-16" className="text-xl" />
          </ToggleButton>
          <ToggleButton value="inline" title="Inline view">
            <Icon icon="octicon:diff-16" className="text-xl" />
          </ToggleButton>
        </ToggleButtonGroup>
        <ToggleButtonGroup value={flags} size="small" className="mx-2" onChange={handleFlagsChange}>
          <ToggleButton value="fold" title="Hide unchanged regions">
            <Icon icon="octicon:fold-16" className="text-xl" />
          </ToggleButton>
        </ToggleButtonGroup>
      </div>
      {left !== undefined || right !== undefined ? (
        <div className="relative w-full h-full">
          <MonacoDiffEditor
            options={fullOptions}
            left={leftContent}
            right={rightContent}
            className="absolute top-0 bottom-0 left-0 right-0"
          />
        </div>
      ) : (
        <div className="m-auto text-4xl font-bold text-paper">NO FILE SELECTED</div>
      )}
    </div>
  );
};

export const DiffViewer = memo(DiffViewer_);
