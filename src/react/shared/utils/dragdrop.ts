export interface DragData {
  "git/branch": { name: string; current: boolean };
}

export const setDragData = <K extends keyof DragData>(
  e: React.DragEvent,
  type: K,
  data: DragData[K]
) => {
  e.dataTransfer.setData(type, JSON.stringify(data));
};

export const isDragDataPresent = <K extends keyof DragData>(e: React.DragEvent, type: K) =>
  e.dataTransfer.types.includes(type);

export const getDragData = <K extends keyof DragData>(e: React.DragEvent, type: K) => {
  if (isDragDataPresent(e, type)) {
    return JSON.parse(e.dataTransfer.getData(type)) as unknown as DragData[K];
  } else {
    return undefined;
  }
};
