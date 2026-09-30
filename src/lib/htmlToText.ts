export function htmlToText(html: string) {
  const doc = new DOMParser().parseFromString(html, "text/html");

  return (doc.body.textContent ?? "").replace(/\s+/g, " ").trim();
}