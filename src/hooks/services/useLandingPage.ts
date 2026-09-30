import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createLandingPage,
  deleteLandingPage,
  getLandingPage,
  updateLandingPage,
} from "@/api/landing-page.api";

import type {
  CreateLandingPageInput,
  UpdateLandingPageInput,
} from "@/typings/landing-page.typings";

export function useLandingPage() {
  return useQuery({
    queryKey: ["landing-page"],
    queryFn: getLandingPage,
  });
}

export function useCreateLandingPage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateLandingPageInput) => createLandingPage(input),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["landing-page"],
      });
    },
  });
}

export function useUpdateLandingPage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateLandingPageInput) => updateLandingPage(input),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["landing-page"],
      });
    },
  });
}

export function useDeleteLandingPage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteLandingPage,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["landing-page"],
      });
    },
  });
}
