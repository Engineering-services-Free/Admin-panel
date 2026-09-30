import type { RichTextEditorImageUploadResult } from "./RichTextEditor.types";
import { uploadImage, type ImageUploadFolder } from "@/api/uploads.api";

export const createRichTextEditorImageUpload = (
  folder: ImageUploadFolder = "editor-images",
) => {
  return async (file: File): Promise<RichTextEditorImageUploadResult> => {
    const result = await uploadImage(file, folder);

    return {
      url: result.url,
      alt: file.name,
    };
  };
};
