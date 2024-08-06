import { formatDate } from "@/date";
import { lineNumbersToRanges } from "@/monaco";
import { shortHash } from "@/util";
import { styled, useTheme } from "@mui/material";
import * as monaco from "monaco-editor";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { MonacoEditor } from "../MonacoEditor";

type IStandaloneCodeEditor = monaco.editor.IStandaloneCodeEditor;
type IEditorConstructionOptions = monaco.editor.IEditorConstructionOptions;
type IModelDecorationOptions = monaco.editor.IModelDecorationOptions;
type IEditorMouseEvent = monaco.editor.IEditorMouseEvent;

const { MouseTargetType, OverviewRulerLane } = monaco.editor;

const StyledMonacoEditor = styled(MonacoEditor)({
  position: "absolute",
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  "& .margin-view-overlays": {
    borderRight: "2px",
    borderStyle: "solid",
    borderColor: "#555 !important"
  },
  "& .line-numbers": {
    color: "#555 !important",
    cursor: "pointer !important",
    paddingLeft: "1rem",
    whiteSpace: "nowrap"
  },
  "& .hunk-border": {
    borderTop: "1px",
    borderStyle: "solid",
    borderColor: "#444"
  },
  "& .hunk-border-margin": {
    borderTop: "1px",
    borderStyle: "solid",
    borderColor: "#444",
    "& ~ .line-numbers": {
      color: "#ddd !important"
    }
  },
  "& .selected-lines": {
    backgroundColor: "rgba(255, 140, 0, 0.6)",
    left: "0 !important",
    width: "4px !important"
  }
});

export interface BlameViewerProps {
  language: string;
  blame: Blame;
  selectedCommitId: string | undefined;
  onUpdateSelectedcommitId: (value: string | undefined) => void;
  onHoveredCommitIdChanged?: (value: string | undefined) => void;
  onContextMenu?: (event: MouseEvent, commitId: string) => void;
}

const useDecorationEffect = (
  editor: IStandaloneCodeEditor | null,
  lineNumbers: number[],
  options: IModelDecorationOptions
): void => {
  useEffect(() => {
    if (!editor) {
      return;
    }
    const ranges = lineNumbersToRanges(lineNumbers);
    const decorations = ranges.map((range) => ({ range, options }));
    const decorationCollection = editor.createDecorationsCollection(decorations);
    return () => {
      decorationCollection.clear();
    };
  }, [editor, lineNumbers, options]);
};

const hunkBorderDecorationOptions: IModelDecorationOptions = {
  className: "hunk-border",
  marginClassName: "hunk-border-margin",
  isWholeLine: true
};
const selectedCommitDecorationOptions: IModelDecorationOptions = {
  linesDecorationsClassName: "selected-lines",
  overviewRuler: {
    color: "rgba(255, 140, 0, 0.6)",
    darkColor: "rgba(255, 140, 0, 0.6)",
    position: OverviewRulerLane.Right
  }
};

const createEditorOptions = (blame: Blame, fontSize: number): IEditorConstructionOptions => {
  const dateMap: Record<string, string> = blame.commits.reduce(
    (prev, cur) => {
      prev[cur.id] = formatDate(cur.date);
      return prev;
    },
    {} as Record<string, string>
  );
  return {
    readOnly: true,
    folding: false,
    minimap: { enabled: false },
    selectOnLineNumbers: false,
    contextmenu: false,
    fontSize,
    lineNumbersMinChars: blame.commitIds.length.toString().length + 22,
    lineNumbers: (lineno: number) => {
      const id = blame.commitIds[lineno - 1];
      if (!id) {
        return "";
      }
      return `${lineno.toString()} ${shortHash(id)} ${dateMap[id]}`;
    }
  };
};

const getHunkBorderLineNumbers = (blame: Blame) => {
  const lineNumbers = blame.commitIds
    .map((id, index, arr) => (id !== arr[index - 1] ? index + 1 : -1))
    .filter((v) => v >= 0);
  lineNumbers.push(blame.commitIds.length + 1);
  return lineNumbers;
};

const BlameViewer_: React.FC<BlameViewerProps> = ({
  language,
  blame,
  selectedCommitId,
  onUpdateSelectedcommitId,
  onHoveredCommitIdChanged,
  onContextMenu
}) => {
  const theme = useTheme();
  const [editor, setEditor] = useState<IStandaloneCodeEditor | null>(null);
  const [hoveredCommitId, setHoveredCommitId] = useState<string | undefined>(undefined);
  const handleEditorMounted = useCallback((editor: IStandaloneCodeEditor) => {
    setEditor(editor);
  }, []);
  const options = useMemo<IEditorConstructionOptions>(
    () => createEditorOptions(blame, theme.custom.baseFontSize),
    [blame, theme.custom.baseFontSize]
  );

  const onResize = useCallback(() => {
    editor?.layout();
  }, [editor]);

  useEffect(() => {
    onHoveredCommitIdChanged?.(hoveredCommitId);
  }, [onHoveredCommitIdChanged, hoveredCommitId]);

  const handleMouseMove = useCallback(
    (e: IEditorMouseEvent) => {
      const commitId = blame.commitIds[(e.target.position?.lineNumber ?? 0) - 1];
      setHoveredCommitId(commitId);
    },
    [blame]
  );
  const handleMouseLeave = useCallback(() => {
    setHoveredCommitId(undefined);
  }, []);

  const handleContextMenu = useCallback(
    (e: IEditorMouseEvent) => {
      if (!e.target.position || !onContextMenu) {
        return;
      }
      const commitId = blame.commitIds[e.target.position.lineNumber - 1];
      if (commitId !== undefined) {
        onContextMenu(e.event.browserEvent, commitId);
      }
    },
    [blame, onContextMenu]
  );

  const handleMouseDown = useCallback(
    (e: IEditorMouseEvent) => {
      const { position, type } = e.target;
      if (!position) {
        return;
      }
      if (
        type === MouseTargetType.GUTTER_GLYPH_MARGIN ||
        type === MouseTargetType.GUTTER_LINE_DECORATIONS ||
        type === MouseTargetType.GUTTER_LINE_NUMBERS ||
        type === MouseTargetType.GUTTER_VIEW_ZONE
      ) {
        const commitId = blame.commitIds[position.lineNumber - 1];
        onUpdateSelectedcommitId(commitId);
      }
    },
    [blame, onUpdateSelectedcommitId]
  );

  useEffect(() => {
    const disposable = editor?.onMouseDown(handleMouseDown);
    return () => disposable?.dispose();
  }, [editor, handleMouseDown]);

  useEffect(() => {
    const disposable = editor?.onMouseMove(handleMouseMove);
    return () => disposable?.dispose();
  }, [editor, handleMouseMove]);

  useEffect(() => {
    const disposable = editor?.onMouseLeave(handleMouseLeave);
    return () => disposable?.dispose();
  }, [editor, handleMouseLeave]);

  useEffect(() => {
    const disposable = editor?.onContextMenu(handleContextMenu);
    return () => disposable?.dispose();
  }, [editor, handleContextMenu]);

  const hunkBorderLineNumbers = useMemo(() => getHunkBorderLineNumbers(blame), [blame]);
  useDecorationEffect(editor, hunkBorderLineNumbers, hunkBorderDecorationOptions);

  const lineNumberMap = useMemo(() => {
    const map: Record<string, number[]> = {};
    blame.commitIds.forEach((commitId, index) => {
      (map[commitId] ?? (map[commitId] = [])).push(index + 1);
    });
    return map;
  }, [blame]);
  const selectedCommitLineNumbers = useMemo(
    () => (selectedCommitId ? (lineNumberMap[selectedCommitId] ?? []) : []),
    [lineNumberMap, selectedCommitId]
  );
  useDecorationEffect(editor, selectedCommitLineNumbers, selectedCommitDecorationOptions);

  return (
    <div className="relative flex-1 overflow-hidden border border-solid border-paper">
      <AutoSizer className="flex flex-1 overflow-hidden" onResize={onResize}>
        {() => (
          <StyledMonacoEditor
            options={options}
            language={language}
            value={blame.content.text}
            onEditorMounted={handleEditorMounted}
          />
        )}
      </AutoSizer>
    </div>
  );
};

export const BlameViewer = memo(BlameViewer_);
