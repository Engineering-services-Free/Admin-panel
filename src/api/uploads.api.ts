import { apiClient } from "./client";

export type ImageUploadFolder =
  | "services"
  | "projects"
  | "clients"
  | "blogs"
  | "founder"
  | "about"
  | "landing-page"
  | "editor-images";

export type DocumentUploadFolder = "documents";

export type ImageUploadResponse = {
  success: boolean;
  message: string;
  data: {
    url: string;
    storagePath: string;
  };
};

export type DocumentUploadResponse = ImageUploadResponse;

export const uploadImage = async (
  file: File,
  folder: ImageUploadFolder,
): Promise<ImageUploadResponse["data"]> => {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("folder", folder);

  const response = await apiClient.post<ImageUploadResponse>(
    "/uploads/image",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data.data;
};

export const uploadDocument = async (
  file: File,
  folder: DocumentUploadFolder,
): Promise<DocumentUploadResponse["data"]> => {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("folder", folder);

  const response = await apiClient.post<DocumentUploadResponse>(
    "/uploads/document",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data.data;
};
