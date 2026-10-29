interface ImageMetadata {
  url?: string;
  alt?: string;
}

export function withGeneratedImageAlt<T extends ImageMetadata>(
  image: T,
  fallback: string,
): T {
  if (
    typeof image.url !== "string" ||
    !image.url.trim() ||
    (typeof image.alt === "string" && image.alt.trim())
  ) {
    return image;
  }

  const alt = fallback.trim();

  return {
    ...image,
    alt: alt || "Image",
  };
}
