import DOMPurify from "dompurify";

const ALLOWED_STYLE_PROPS = new Set(["color", "text-align"]);

// White, black and grays come from the editor theme, not from the author.
function isNeutralColor(value: string) {
  const v = value.trim().toLowerCase();

  if (["white", "black", "#fff", "#ffffff", "#000", "#000000"].includes(v)) {
    return true;
  }

  const rgb = v.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);

  if (!rgb) {
    return false;
  }

  const channels = [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];

  return Math.max(...channels) - Math.min(...channels) < 20;
}

DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (!(node instanceof HTMLElement)) {
    return;
  }

  if (node.tagName === "A" && node.getAttribute("target") === "_blank") {
    node.setAttribute("rel", "noopener noreferrer");
  }

  if (!node.hasAttribute("style")) {
    return;
  }

  const kept: string[] = [];

  for (const prop of Array.from(node.style)) {
    const value = node.style.getPropertyValue(prop);

    if (!ALLOWED_STYLE_PROPS.has(prop)) {
      continue;
    }

    if (prop === "color" && isNeutralColor(value)) {
      continue;
    }

    kept.push(`${prop}: ${value}`);
  }

  if (kept.length > 0) {
    node.setAttribute("style", kept.join("; "));
  } else {
    node.removeAttribute("style");
  }
});

export function sanitizeRichText(html: string) {
  return DOMPurify.sanitize(html, { ADD_ATTR: ["target"] });
}
