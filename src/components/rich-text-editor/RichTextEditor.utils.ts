export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}

export function normalizeEditorHtml(value?: string): string {
  if (!value || value === "<p></p>") {
    return "";
  }

  return value;
}

export function getPlainTextFromHtml(html: string): string {
  if (typeof window === "undefined") {
    return html
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  const container = document.createElement("div");
  container.innerHTML = html;

  return (container.textContent || container.innerText || "")
    .replace(/\s+/g, " ")
    .trim();
}

export function getWordCount(text: string): number {
  const trimmed = text.trim();

  if (!trimmed) {
    return 0;
  }

  return trimmed.split(/\s+/).length;
}

export function isSafeHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function createEditorId(providedId?: string): string {
  if (providedId) {
    return providedId;
  }

  return `rich-text-editor-${Math.random().toString(36).slice(2, 10)}`;
}
    