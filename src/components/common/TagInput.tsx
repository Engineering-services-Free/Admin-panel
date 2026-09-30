import { useState } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TagInputProps {
  id?: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  max?: number;
  disabled?: boolean;
}

export function TagInput({
  id,
  value,
  onChange,
  placeholder,
  max = 30,
  disabled,
}: TagInputProps) {
  const [draft, setDraft] = useState("");

  const addTag = () => {
    const tag = draft.trim().replace(/,$/, "").trim();

    setDraft("");

    if (!tag || value.length >= max) {
      return;
    }

    if (value.some((item) => item.toLowerCase() === tag.toLowerCase())) {
      return;
    }

    onChange([...value, tag]);
  };

  return (
    <div className="grid gap-3">
      <div className="flex gap-2">
        <Input
          id={id}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === ",") {
              event.preventDefault();
              addTag();
            }
          }}
          placeholder={placeholder}
          disabled={disabled || value.length >= max}
        />

        <Button
          type="button"
          variant="outline"
          onClick={addTag}
          disabled={disabled || !draft.trim() || value.length >= max}
        >
          Add
        </Button>
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full border bg-muted/50 py-1 pl-3 pr-1.5 text-sm"
            >
              {tag}

              <button
                type="button"
                aria-label={`Remove ${tag}`}
                disabled={disabled}
                className="rounded-full p-0.5 text-muted-foreground hover:text-foreground"
                onClick={() => onChange(value.filter((item) => item !== tag))}
              >
                <X className="size-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Press Enter to add. {value.length} / {max}
      </p>
    </div>
  );
}
