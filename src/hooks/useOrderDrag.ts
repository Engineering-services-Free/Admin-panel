import { useState, type DragEvent } from "react";

interface OrderedRecord {
  id: string;
}

interface UseOrderDragOptions<T extends OrderedRecord> {
  items: T[];
  enabled: boolean;
  firstPosition: number;
  onMove: (id: string, order: number) => Promise<unknown>;
}

export function useOrderDrag<T extends OrderedRecord>({
  items,
  enabled,
  firstPosition,
  onMove,
}: UseOrderDragOptions<T>) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  const clearDrag = () => {
    setDraggedId(null);
    setDropTargetId(null);
  };

  const rowProps = (id: string, index: number) => ({
    draggable: enabled,
    className:
      draggedId === id
        ? "opacity-50"
        : dropTargetId === id
          ? "border-t-2 border-t-primary bg-primary/10"
          : undefined,
    onDragStart: (event: DragEvent<HTMLElement>) => {
      if (!enabled) return;

      if (
        event.target instanceof Element &&
        event.target.closest("button, a, input, select, textarea")
      ) {
        event.preventDefault();
        return;
      }

      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", id);
      setDraggedId(id);
    },
    onDragOver: (event: DragEvent<HTMLElement>) => {
      if (!enabled || !draggedId || draggedId === id) return;

      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      setDropTargetId(id);
    },
    onDrop: (event: DragEvent<HTMLElement>) => {
      event.preventDefault();

      if (!enabled || !draggedId || draggedId === id) {
        clearDrag();
        return;
      }

      const sourceIndex = items.findIndex((item) => item.id === draggedId);
      if (sourceIndex !== -1 && sourceIndex !== index) {
        void onMove(draggedId, firstPosition + index).catch(() => {
          // The owning mutation exposes the failure to the page.
        });
      }

      clearDrag();
    },
    onDragEnd: clearDrag,
  });

  return { rowProps };
}
