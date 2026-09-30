import { apiClient } from "./client";

import type {
  CreateProjectInput,
  CreateProjectResponse,
  DeleteProjectResponse,
  GetProjectResponse,
  GetProjectsParams,
  GetProjectsResponse,
  Project,
  UpdateProjectInput,
  UpdateProjectResponse,
} from "../typings/projects.typings";

// Lean documents skip toJSON, so map `_id` to `id` here.
type RawProject = Omit<Project, "id"> & { id?: string; _id?: string };

function normalizeProject(raw: RawProject): Project {
  const { _id, id, ...rest } = raw;

  return { ...rest, id: id ?? _id ?? "" };
}

type WithData<T, D> = Omit<T, "data"> & { data: D };

export function getProjects(
  params?: GetProjectsParams,
): Promise<GetProjectsResponse> {
  return apiClient
    .get<WithData<GetProjectsResponse, RawProject[]>>("/projects", { params })
    .then((response) => ({
      ...response.data,
      data: response.data.data.map(normalizeProject),
    }));
}

export function getProjectById(id: string): Promise<GetProjectResponse> {
  return apiClient
    .get<WithData<GetProjectResponse, RawProject>>(`/projects/${id}`)
    .then((response) => ({
      ...response.data,
      data: normalizeProject(response.data.data),
    }));
}

export function getProjectBySlug(slug: string): Promise<GetProjectResponse> {
  return apiClient
    .get<WithData<GetProjectResponse, RawProject>>(`/projects/slug/${slug}`)
    .then((response) => ({
      ...response.data,
      data: normalizeProject(response.data.data),
    }));
}

export function createProject(
  input: CreateProjectInput,
): Promise<CreateProjectResponse> {
  return apiClient
    .post<WithData<CreateProjectResponse, RawProject>>("/projects", input)
    .then((response) => ({
      ...response.data,
      data: normalizeProject(response.data.data),
    }));
}

export function updateProject(
  id: string,
  input: UpdateProjectInput,
): Promise<UpdateProjectResponse> {
  return apiClient
    .patch<
      WithData<UpdateProjectResponse, RawProject>
    >(`/projects/${id}`, input)
    .then((response) => ({
      ...response.data,
      data: normalizeProject(response.data.data),
    }));
}

export function deleteProject(id: string): Promise<DeleteProjectResponse> {
  return apiClient
    .delete<DeleteProjectResponse>(`/projects/${id}`)
    .then((response) => response.data);
}
