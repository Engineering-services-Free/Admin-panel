import { apiClient } from "./client";

import type {
  CreateLandingPageInput,
  CreateLandingPageResponse,
  DeleteLandingPageResponse,
  GetLandingPageResponse,
  LandingPage,
  UpdateLandingPageInput,
  UpdateLandingPageResponse,
} from "../typings/landing-page.typings";

type RawLandingPage = Omit<LandingPage, "id"> & { id?: string; _id?: string };

function normalizeLandingPage(raw: RawLandingPage): LandingPage {
  const { _id, id, ...rest } = raw;

  return { ...rest, id: id ?? _id ?? "" };
}

export function getLandingPage(): Promise<GetLandingPageResponse> {
  return apiClient
    .get<
      Omit<GetLandingPageResponse, "data"> & { data: RawLandingPage | null }
    >("/landing-page")
    .then((response) => ({
      ...response.data,
      data: response.data.data
        ? normalizeLandingPage(response.data.data)
        : null,
    }));
}

export function createLandingPage(
  input: CreateLandingPageInput,
): Promise<CreateLandingPageResponse> {
  return apiClient
    .post<
      Omit<CreateLandingPageResponse, "data"> & { data: RawLandingPage }
    >("/landing-page", input)
    .then((response) => ({
      ...response.data,
      data: normalizeLandingPage(response.data.data),
    }));
}

export function updateLandingPage(
  input: UpdateLandingPageInput,
): Promise<UpdateLandingPageResponse> {
  return apiClient
    .patch<
      Omit<UpdateLandingPageResponse, "data"> & { data: RawLandingPage }
    >("/landing-page", input)
    .then((response) => ({
      ...response.data,
      data: normalizeLandingPage(response.data.data),
    }));
}

export function deleteLandingPage(): Promise<DeleteLandingPageResponse> {
  return apiClient
    .delete<DeleteLandingPageResponse>("/landing-page")
    .then((response) => response.data);
}
