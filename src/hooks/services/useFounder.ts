import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createFounder,
  deleteFounder,
  getFounderById,
  getFounders,
  reorderFounder,
  updateFounder,
} from "@/api/founder.api";

import type {
  CreateFounderInput,
  GetFoundersResponse,
  UpdateFounderInput,
} from "@/typings/founder.typings";
import { moveItemInOrderedList } from "@/lib/optimisticOrder";

export function useFounders() {
  return useQuery({
    queryKey: ["founder"],
    queryFn: getFounders,
  });
}

export function useFounder(id: string) {
  return useQuery({
    queryKey: ["founder", id],
    queryFn: () => getFounderById(id),
    enabled: Boolean(id),
  });
}

export function useCreateFounder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateFounderInput) => createFounder(input),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["founder"],
      });
    },
  });
}

interface UpdateFounderVariables {
  id: string;
  data: UpdateFounderInput;
}

export function useUpdateFounder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateFounderVariables) =>
      updateFounder(id, data),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["founder"],
      });

      queryClient.invalidateQueries({
        queryKey: ["founder", variables.id],
      });
    },
  });
}

export function useDeleteFounder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteFounder(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["founder"],
      });
    },
  });
}

export function useReorderFounder() {
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
    }) => reorderFounder(id, order),
    onMutate: async (variables: {
      id: string;
      order: number;
      queryKey: readonly unknown[];
      firstPosition: number;
    }) => {
      await queryClient.cancelQueries({ queryKey: variables.queryKey });
      const previous = queryClient.getQueryData<GetFoundersResponse>(
        variables.queryKey,
      );

      queryClient.setQueryData<GetFoundersResponse>(
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
      queryClient.invalidateQueries({ queryKey: ["founder"] });
    },
  });
}
