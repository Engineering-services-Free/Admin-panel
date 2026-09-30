import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createFounder,
  deleteFounder,
  getFounderById,
  getFounders,
  updateFounder,
} from "@/api/founder.api";

import type {
  CreateFounderInput,
  UpdateFounderInput,
} from "@/typings/founder.typings";

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
