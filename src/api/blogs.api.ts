import { apiClient } from "./client";

import type {
  CreateBlogInput,
  CreateBlogResponse,
  DeleteBlogResponse,
  GetBlogResponse,
  GetBlogsParams,
  GetBlogsResponse,
  UpdateBlogInput,
  UpdateBlogResponse,
} from "../typings/blogs.typings";

export function getBlogs(params?: GetBlogsParams): Promise<GetBlogsResponse> {
  return apiClient
    .get<GetBlogsResponse>("/blogs", {
      params,
    })
    .then((response) => response.data);
}

export function getBlogById(id: string): Promise<GetBlogResponse> {
  return apiClient
    .get<GetBlogResponse>(`/blogs/${id}`)
    .then((response) => response.data);
}

export function getBlogBySlug(slug: string): Promise<GetBlogResponse> {
  return apiClient
    .get<GetBlogResponse>(`/blogs/slug/${slug}`)
    .then((response) => response.data);
}

export function createBlog(
  input: CreateBlogInput,
): Promise<CreateBlogResponse> {
  return apiClient
    .post<CreateBlogResponse>("/blogs", input)
    .then((response) => response.data);
}

export function updateBlog(
  id: string,
  input: UpdateBlogInput,
): Promise<UpdateBlogResponse> {
  return apiClient
    .patch<UpdateBlogResponse>(`/blogs/${id}`, input)
    .then((response) => response.data);
}

export function deleteBlog(id: string): Promise<DeleteBlogResponse> {
  return apiClient
    .delete<DeleteBlogResponse>(`/blogs/${id}`)
    .then((response) => response.data);
}
