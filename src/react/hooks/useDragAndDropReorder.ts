import { useCallback, useState } from "react";

export interface DragAndDropReorderHandlers {
  handleDragStart: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  handleDragLeave: () => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => void;
  handleDragEnd: () => void;
  handleKeyDown: (e: React.KeyboardEvent, index: number) => void;
}

export interface DragAndDropReorderState {
  draggedIndex: number | null;
  dragOverIndex: number | null;
  insertPosition: "before" | "after";
}

export interface UseDragAndDropReorderReturn extends DragAndDropReorderState {
  handlers: DragAndDropReorderHandlers;
}

/**
 * Custom hook for drag-and-drop reordering of items in a list
 *
 * @param items - Array of items to reorder
 * @param onChange - Callback function called with the new order when items are reordered
 * @returns State and handlers for drag-and-drop functionality
 */
export const useDragAndDropReorder = <T>(
  items: T[],
  onChange: (newItems: T[]) => void
): UseDragAndDropReorderReturn => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [insertPosition, setInsertPosition] = useState<"before" | "after">("before");

  const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>, index: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";

      if (draggedIndex !== null && draggedIndex !== index) {
        // Calculate if cursor is in top half or bottom half of the element
        const rect = e.currentTarget.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;
        const position = e.clientY < midpoint ? "before" : "after";

        setDragOverIndex(index);
        setInsertPosition(position);
      }
    },
    [draggedIndex]
  );

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
      e.preventDefault();

      if (draggedIndex === null || draggedIndex === dropIndex) {
        setDraggedIndex(null);
        setDragOverIndex(null);
        return;
      }

      // Calculate actual insert position based on cursor position
      let actualInsertIndex = dropIndex;
      if (insertPosition === "after") {
        actualInsertIndex = dropIndex + 1;
      }

      // Adjust for the removal of the dragged item
      if (draggedIndex < actualInsertIndex) {
        actualInsertIndex--;
      }

      // Reorder array
      const newItems = [...items];
      const [draggedItem] = newItems.splice(draggedIndex, 1);
      if (draggedItem) {
        newItems.splice(actualInsertIndex, 0, draggedItem);
      }

      onChange(newItems);

      // Reset state
      setDraggedIndex(null);
      setDragOverIndex(null);
    },
    [draggedIndex, insertPosition, items, onChange]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      if (e.key === "ArrowUp" && index > 0) {
        e.preventDefault();
        const newItems = [...items];
        const current = newItems[index];
        const above = newItems[index - 1];
        if (current && above) {
          newItems[index - 1] = current;
          newItems[index] = above;
          onChange(newItems);
        }
      } else if (e.key === "ArrowDown" && index < items.length - 1) {
        e.preventDefault();
        const newItems = [...items];
        const current = newItems[index];
        const below = newItems[index + 1];
        if (current && below) {
          newItems[index] = below;
          newItems[index + 1] = current;
          onChange(newItems);
        }
      }
    },
    [items, onChange]
  );

  return {
    draggedIndex,
    dragOverIndex,
    insertPosition,
    handlers: {
      handleDragStart,
      handleDragOver,
      handleDragLeave,
      handleDrop,
      handleDragEnd,
      handleKeyDown
    }
  };
};
