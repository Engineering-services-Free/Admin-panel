import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createAbout,
  deleteAbout,
  getAbout,
  updateAbout,
} from "@/api/about.api";

import type {
  CreateAboutInput,
  UpdateAboutInput,
} from "@/typings/about.typings";

export function useAbout() {
  return useQuery({
    queryKey: ["about"],
    queryFn: getAbout,
  });
}

export function useCreateAbout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateAboutInput) => createAbout(input),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["about"],
      });
    },
  });
}

export function useUpdateAbout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateAboutInput) => updateAbout(input),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["about"],
      });
    },
  });
}

export function useDeleteAbout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAbout,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["about"],
      });
    },
  });
}
