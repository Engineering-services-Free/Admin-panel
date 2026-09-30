import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createService,
  deleteService,
  getServiceById,
  getServiceBySlug,
  getServices,
  updateService,
} from "@/api/services.api";

import type {
  CreateServiceInput,
  GetServicesParams,
  UpdateServiceInput,
} from "@/typings/services.typings";

export function useServices(params?: GetServicesParams) {
  return useQuery({
    queryKey: ["services", params],
    queryFn: () => getServices(params),
  });
}

export function useService(id: string) {
  return useQuery({
    queryKey: ["services", id],
    queryFn: () => getServiceById(id),
    enabled: Boolean(id),
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateServiceInput) => createService(input),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["services"],
      });
    },
  });
}

interface UpdateServiceVariables {
  id: string;
  data: UpdateServiceInput;
}

export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateServiceVariables) =>
      updateService(id, data),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["services"],
      });

      queryClient.invalidateQueries({
        queryKey: ["services", variables.id],
      });
    },
  });
}

export function useServiceBySlug(slug: string) {
  return useQuery({
    queryKey: ["services", "slug", slug],
    queryFn: () => getServiceBySlug(slug),
    enabled: Boolean(slug),
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteService(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["services"],
      });
    },
  });
}
