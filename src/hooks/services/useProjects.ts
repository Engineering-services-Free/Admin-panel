import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createProject,
  deleteProject,
  getProjectById,
  getProjects,
  reorderProject,
  updateProject,
} from "@/api/projects.api";

import type {
  CreateProjectInput,
  GetProjectsParams,
  GetProjectsResponse,
  UpdateProjectInput,
} from "@/typings/projects.typings";
import { moveItemInOrderedList } from "@/lib/optimisticOrder";

export function useProjects(params?: GetProjectsParams) {
  return useQuery({
    queryKey: ["projects", params],
    queryFn: () => getProjects(params),
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ["projects", id],
    queryFn: () => getProjectById(id),
    enabled: Boolean(id),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProjectInput) => createProject(input),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects"],
      });
    },
  });
}

interface UpdateProjectVariables {
  id: string;
  data: UpdateProjectInput;
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateProjectVariables) =>
      updateProject(id, data),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["projects"],
      });

      queryClient.invalidateQueries({
        queryKey: ["projects", variables.id],
      });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProject(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects"],
      });
    },
  });
}

export function useReorderProject() {
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
    }) => reorderProject(id, order),
    onMutate: async (variables: {
      id: string;
      order: number;
      queryKey: readonly unknown[];
      firstPosition: number;
    }) => {
      await queryClient.cancelQueries({ queryKey: variables.queryKey });
      const previous = queryClient.getQueryData<GetProjectsResponse>(
        variables.queryKey,
      );

      queryClient.setQueryData<GetProjectsResponse>(
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
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
