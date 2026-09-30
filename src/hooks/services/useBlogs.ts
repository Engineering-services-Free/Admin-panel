import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createBlog,
  deleteBlog,
  getBlogById,
  getBlogs,
  updateBlog,
} from "@/api/blogs.api";

import type {
  CreateBlogInput,
  GetBlogsParams,
  UpdateBlogInput,
} from "@/typings/blogs.typings";

export function useBlogs(params?: GetBlogsParams) {
  return useQuery({
    queryKey: ["blogs", params],
    queryFn: () => getBlogs(params),
  });
}

export function useBlog(id: string) {
  return useQuery({
    queryKey: ["blogs", id],
    queryFn: () => getBlogById(id),
    enabled: Boolean(id),
  });
}

export function useCreateBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateBlogInput) => createBlog(input),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["blogs"],
      });
    },
  });
}

interface UpdateBlogVariables {
  id: string;
  data: UpdateBlogInput;
}

export function useUpdateBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateBlogVariables) => updateBlog(id, data),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["blogs"],
      });

      queryClient.invalidateQueries({
        queryKey: ["blogs", variables.id],
      });
    },
  });
}

export function useDeleteBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteBlog(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["blogs"],
      });
    },
  });
}
