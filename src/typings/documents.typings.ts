export type DocumentType =
  | "brochure"
  | "certificate"
  | "company-profile"
  | "presentation"
  | "other";

export type DocumentVisibility = "public" | "internal";

export interface DocumentFile {
  url: string;
  storagePath: string;
}

export interface Document {
  id: string;

  title: string;

  type: DocumentType;

  description?: string;

  clientId?: string;

  file: DocumentFile;

  visibility: DocumentVisibility;

  order: number;

  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDocumentInput {
  title: string;

  type: DocumentType;

  description?: string;

  clientId?: string

  file: DocumentFile;

  visibility: DocumentVisibility;

  order: number;
}

// The backend accepts null on update to clear the client
export type UpdateDocumentInput = Partial<
  Omit<CreateDocumentInput, "clientId">
> & {
  clientId?: string | null;
};

// Used by DocumentForm
export type DocumentFormValues = Omit<CreateDocumentInput, "clientId"> & {
  clientId?: string | null;
};

export interface GetDocumentsParams {
  page?: number;
  limit?: number;
  type?: DocumentType;
  visibility?: DocumentVisibility;
  clientId?: string;
}

export interface DocumentPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface GetDocumentsResponse {
  success: true;
  data: Document[];
  pagination: DocumentPagination;
}

export interface GetDocumentResponse {
  success: true;
  data: Document;
}

export interface CreateDocumentResponse {
  success: true;
  data: Document;
}

export interface UpdateDocumentResponse {
  success: true;
  data: Document;
}

export interface DeleteDocumentResponse {
  success: true;
  message?: string;
}
