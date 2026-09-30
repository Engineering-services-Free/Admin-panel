import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createDocument,
  deleteDocument,
  getDocumentById,
  getDocuments,
  updateDocument,
} from "@/api/documents.api";

import type {
  CreateDocumentInput,
  GetDocumentsParams,
  UpdateDocumentInput,
} from "@/typings/documents.typings";

export function useDocuments(params?: GetDocumentsParams) {
  return useQuery({
    queryKey: ["documents", params],
    queryFn: () => getDocuments(params),
  });
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: ["documents", id],
    queryFn: () => getDocumentById(id),
    enabled: Boolean(id),
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateDocumentInput) => createDocument(input),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["documents"],
      });
    },
  });
}

interface UpdateDocumentVariables {
  id: string;
  data: UpdateDocumentInput;
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateDocumentVariables) =>
      updateDocument(id, data),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["documents"],
      });

      queryClient.invalidateQueries({
        queryKey: ["documents", variables.id],
      });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDocument(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["documents"],
      });
    },
  });
}
