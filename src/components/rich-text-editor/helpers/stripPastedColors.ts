// Pasted text carries the source page's colors (often white from dark mode).
// Remove them so text follows the theme. Colors picked with the toolbar are unaffected.
export function stripPastedColors(html: string) {
  const doc = new DOMParser().parseFromString(html, "text/html");

  doc.body.querySelectorAll<HTMLElement>("[style]").forEach((element) => {
    element.style.removeProperty("color");

    if (!element.getAttribute("style")?.trim()) {
      element.removeAttribute("style");
    }
  });

  doc.body.querySelectorAll("font[color]").forEach((element) => {
    element.removeAttribute("color");
  });

  return doc.body.innerHTML;
}