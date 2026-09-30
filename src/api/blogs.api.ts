import { apiClient } from "./client";

import type {
  Blog,
  CreateBlogInput,
  CreateBlogResponse,
  DeleteBlogResponse,
  GetBlogResponse,
  GetBlogsParams,
  GetBlogsResponse,
  UpdateBlogInput,
  UpdateBlogResponse,
} from "../typings/blogs.typings";

// Lean documents skip toJSON, so map `_id` to `id` here.
type RawBlog = Omit<Blog, "id"> & { id?: string; _id?: string };

function normalizeBlog(raw: RawBlog): Blog {
  const { _id, id, ...rest } = raw;

  return { ...rest, id: id ?? _id ?? "" };
}

type WithData<T, D> = Omit<T, "data"> & { data: D };

export function getBlogs(params?: GetBlogsParams): Promise<GetBlogsResponse> {
  return apiClient
    .get<WithData<GetBlogsResponse, RawBlog[]>>("/blogs", { params })
    .then((response) => ({
      ...response.data,
      data: response.data.data.map(normalizeBlog),
    }));
}

export function getBlogById(id: string): Promise<GetBlogResponse> {
  return apiClient
    .get<WithData<GetBlogResponse, RawBlog>>(`/blogs/${id}`)
    .then((response) => ({
      ...response.data,
      data: normalizeBlog(response.data.data),
    }));
}

export function getBlogBySlug(slug: string): Promise<GetBlogResponse> {
  return apiClient
    .get<WithData<GetBlogResponse, RawBlog>>(`/blogs/slug/${slug}`)
    .then((response) => ({
      ...response.data,
      data: normalizeBlog(response.data.data),
    }));
}

export function createBlog(
  input: CreateBlogInput,
): Promise<CreateBlogResponse> {
  return apiClient
    .post<WithData<CreateBlogResponse, RawBlog>>("/blogs", input)
    .then((response) => ({
      ...response.data,
      data: normalizeBlog(response.data.data),
    }));
}

export function updateBlog(
  id: string,
  input: UpdateBlogInput,
): Promise<UpdateBlogResponse> {
  return apiClient
    .patch<WithData<UpdateBlogResponse, RawBlog>>(`/blogs/${id}`, input)
    .then((response) => ({
      ...response.data,
      data: normalizeBlog(response.data.data),
    }));
}

export function deleteBlog(id: string): Promise<DeleteBlogResponse> {
  return apiClient
    .delete<DeleteBlogResponse>(`/blogs/${id}`)
    .then((response) => response.data);
}
