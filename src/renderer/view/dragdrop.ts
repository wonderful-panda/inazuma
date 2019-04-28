interface DragData {
  "git/branch": { name: string; isCurrent?: boolean };
}

export const dragdrop = {
  setData<K extends keyof DragData>(
    event: DragEvent,
    type: K,
    data: DragData[K]
  ): void {
    if (!event.dataTransfer) {
      return;
    }
    event.dataTransfer.setData(type, JSON.stringify(data));
  },
  isDataPresent(event: DragEvent, type: keyof DragData): boolean {
    if (!event.dataTransfer) {
      return false;
    }
    return event.dataTransfer.types.indexOf(type) >= 0;
  },
  getData<K extends keyof DragData>(
    event: DragEvent,
    type: K
  ): DragData[K] | undefined {
    if (!event.dataTransfer) {
      return undefined;
    }
    const data = event.dataTransfer.getData(type);
    if (data === undefined) {
      return undefined;
    }
    return JSON.parse(data) as DragData[K];
  }
};
