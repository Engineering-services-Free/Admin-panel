import { isRequiredPersistenceField } from "@/lib/persistenceFieldLabels";
import type { PersistenceEntity } from "../../../../Api-processor/src/persistance/required-fields";

interface PersistenceRequiredIndicatorProps {
  entity: PersistenceEntity;
  field: string;
}

export function PersistenceRequiredIndicator({
  entity,
  field,
}: PersistenceRequiredIndicatorProps) {
  if (!isRequiredPersistenceField(entity, field)) {
    return null;
  }

  return (
    <span aria-hidden="true" className="ml-1 text-destructive">
      *
    </span>
  );
}
