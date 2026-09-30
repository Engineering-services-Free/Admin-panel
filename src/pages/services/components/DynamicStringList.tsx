import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DynamicStringListProps {
  label: string;
  description?: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function DynamicStringList({
  label,
  description,
  values,
  onChange,
  placeholder = "Enter value",
  disabled = false,
}: DynamicStringListProps) {
  const handleChange = (index: number, value: string) => {
    const updatedValues = [...values];

    updatedValues[index] = value;

    onChange(updatedValues);
  };

  const handleAdd = () => {
    onChange([...values, ""]);
  };

  const handleRemove = (index: number) => {
    onChange(values.filter((_, currentIndex) => currentIndex !== index));
  };

  return (
    <div className="grid gap-4">
      <div>
        <Label>{label}</Label>

        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </div>

      <div className="grid gap-3">
        {values.map((value, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={value}
              onChange={(event) => handleChange(index, event.target.value)}
              placeholder={placeholder}
              disabled={disabled}
            />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleRemove(index)}
              disabled={disabled}
              aria-label={`Remove ${label} ${index + 1}`}
            >
              <Trash2 />
            </Button>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          className="w-fit"
          onClick={handleAdd}
          disabled={disabled}
        >
          <Plus />
          Add {label}
        </Button>
      </div>
    </div>
  );
}
