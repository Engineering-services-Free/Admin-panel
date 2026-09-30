import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createContact,
  deleteContact,
  getContact,
  updateContact,
} from "@/api/contact.api";

import type {
  CreateContactInput,
  UpdateContactInput,
} from "@/typings/contact.typings";

export function useContact() {
  return useQuery({
    queryKey: ["contact"],
    queryFn: getContact,
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateContactInput) => createContact(input),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["contact"],
      });
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateContactInput) => updateContact(input),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["contact"],
      });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteContact,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["contact"],
      });
    },
  });
}
