import { apiClient } from "./client";

import type {
  CreateAboutInput,
  CreateAboutResponse,
  DeleteAboutResponse,
  GetAboutResponse,
  UpdateAboutInput,
  UpdateAboutResponse,
} from "../typings/about.typings";

export function getAbout(): Promise<GetAboutResponse> {
  return apiClient
    .get<GetAboutResponse>("/about")
    .then((response) => response.data);
}

export function createAbout(
  input: CreateAboutInput,
): Promise<CreateAboutResponse> {
  return apiClient
    .post<CreateAboutResponse>("/about", input)
    .then((response) => response.data);
}

export function updateAbout(
  input: UpdateAboutInput,
): Promise<UpdateAboutResponse> {
  return apiClient
    .patch<UpdateAboutResponse>("/about", input)
    .then((response) => response.data);
}

export function deleteAbout(): Promise<DeleteAboutResponse> {
  return apiClient
    .delete<DeleteAboutResponse>("/about")
    .then((response) => response.data);
}
