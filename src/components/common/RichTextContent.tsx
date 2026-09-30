import { useMemo } from "react";

import { cn } from "@/lib/utils";
import { RICH_TEXT_CLASSES } from "@/lib/richTextClasses";
import { sanitizeRichText } from "@/lib/sanitizeRichText";

export function RichTextContent({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  const safeHtml = useMemo(() => sanitizeRichText(html), [html]);

  return (
    <div
      className={cn(RICH_TEXT_CLASSES, className)}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
