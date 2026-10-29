import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createService,
  deleteService,
  getServiceById,
  getServiceBySlug,
  getServices,
  reorderService,
  updateService,
} from "@/api/services.api";

import type {
  CreateServiceInput,
  GetServicesParams,
  GetServicesResponse,
  UpdateServiceInput,
} from "@/typings/services.typings";
import { moveItemInOrderedList } from "@/lib/optimisticOrder";

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

export function useReorderService() {
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
    }) => reorderService(id, order),
    onMutate: async (variables: {
      id: string;
      order: number;
      queryKey: readonly unknown[];
      firstPosition: number;
    }) => {
      await queryClient.cancelQueries({ queryKey: variables.queryKey });
      const previous = queryClient.getQueryData<GetServicesResponse>(
        variables.queryKey,
      );

      queryClient.setQueryData<GetServicesResponse>(
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
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
}
