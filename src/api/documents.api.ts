import { apiClient } from "./client";

import type {
  CreateDocumentInput,
  CreateDocumentResponse,
  DeleteDocumentResponse,
  Document,
  GetDocumentResponse,
  GetDocumentsParams,
  GetDocumentsResponse,
  UpdateDocumentInput,
  UpdateDocumentResponse,
} from "../typings/documents.typings";

// MongoDB/Mongoose may return _id instead of id
type RawDocument = Omit<Document, "id"> & {
  id?: string;
  _id?: string;
};

function normalizeDocument(raw: RawDocument): Document {
  const { _id, id, ...rest } = raw;

  return {
    ...rest,
    id: id ?? _id ?? "",
  };
}

type WithData<T, D> = Omit<T, "data"> & {
  data: D;
};

export function getDocuments(
  params?: GetDocumentsParams,
): Promise<GetDocumentsResponse> {
  return apiClient
    .get<WithData<GetDocumentsResponse, RawDocument[]>>("/documents", {
      params,
    })
    .then((response) => ({
      ...response.data,
      data: response.data.data.map(normalizeDocument),
    }));
}

export function getDocumentById(id: string): Promise<GetDocumentResponse> {
  return apiClient
    .get<WithData<GetDocumentResponse, RawDocument>>(`/documents/${id}`)
    .then((response) => ({
      ...response.data,
      data: normalizeDocument(response.data.data),
    }));
}

export function createDocument(
  input: CreateDocumentInput,
): Promise<CreateDocumentResponse> {
  return apiClient
    .post<WithData<CreateDocumentResponse, RawDocument>>("/documents", input)
    .then((response) => ({
      ...response.data,
      data: normalizeDocument(response.data.data),
    }));
}

export function updateDocument(
  id: string,
  input: UpdateDocumentInput,
): Promise<UpdateDocumentResponse> {
  return apiClient
    .patch<
      WithData<UpdateDocumentResponse, RawDocument>
    >(`/documents/${id}`, input)
    .then((response) => ({
      ...response.data,
      data: normalizeDocument(response.data.data),
    }));
}

export function deleteDocument(id: string): Promise<DeleteDocumentResponse> {
  return apiClient
    .delete<DeleteDocumentResponse>(`/documents/${id}`)
    .then((response) => response.data);
}
