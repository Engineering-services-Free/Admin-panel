import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createDocument,
  deleteDocument,
  getDocumentById,
  getDocuments,
  reorderDocument,
  updateDocument,
} from "@/api/documents.api";

import type {
  CreateDocumentInput,
  GetDocumentsResponse,
  GetDocumentsParams,
  UpdateDocumentInput,
} from "@/typings/documents.typings";
import { moveItemInOrderedList } from "@/lib/optimisticOrder";

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

export function useReorderDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      order,
    }: {
      id: string;
      order: number;
      queryKey: readonly unknown[];
      firstPosition: number;
    }) => reorderDocument(id, order),
    onMutate: async (variables: {
      id: string;
      order: number;
      queryKey: readonly unknown[];
      firstPosition: number;
    }) => {
      await queryClient.cancelQueries({ queryKey: variables.queryKey });
      const previous = queryClient.getQueryData<GetDocumentsResponse>(
        variables.queryKey,
      );

      queryClient.setQueryData<GetDocumentsResponse>(
        variables.queryKey,
        (current) =>
          current
            ? {
                ...current,
                data: moveItemInOrderedList(
                  current.data,
                  variables.id,
                  variables.order,
                  variables.firstPosition,
                ),
              }
            : current,
      );

      return { queryKey: variables.queryKey, previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(context.queryKey, context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}
