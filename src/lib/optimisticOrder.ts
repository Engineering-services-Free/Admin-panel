export interface OrderedListItem {
  id: string;
  order: number;
}

export function moveItemInOrderedList<T extends OrderedListItem>(
  items: T[],
  id: string,
  order: number,
  firstPosition: number,
): T[] {
  const sourceIndex = items.findIndex((item) => item.id === id);
  const destinationIndex = order - firstPosition;

  if (
    sourceIndex < 0 ||
    destinationIndex < 0 ||
    destinationIndex >= items.length ||
    sourceIndex === destinationIndex
  ) {
    return items;
  }

  const reordered = [...items];
  const [movedItem] = reordered.splice(sourceIndex, 1);
  reordered.splice(destinationIndex, 0, movedItem);

  return reordered.map((item, index) => ({
    ...item,
    order: firstPosition + index,
  }));
}
