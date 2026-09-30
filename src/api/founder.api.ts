import { apiClient } from "./client";

import type {
  CreateFounderInput,
  CreateFounderResponse,
  DeleteFounderResponse,
  Founder,
  GetFounderResponse,
  GetFoundersResponse,
  UpdateFounderInput,
  UpdateFounderResponse,
} from "../typings/founder.typings";

type RawFounder = Omit<Founder, "id"> & { id?: string; _id?: string };

function normalizeFounder(raw: RawFounder): Founder {
  const { _id, id, ...rest } = raw;

  return { ...rest, id: id ?? _id ?? "" };
}

export function getFounders(): Promise<GetFoundersResponse> {
  return apiClient
    .get<Omit<GetFoundersResponse, "data"> & { data: RawFounder[] }>("/founder")
    .then((response) => ({
      ...response.data,
      data: response.data.data.map(normalizeFounder),
    }));
}

export function getFounderById(id: string): Promise<GetFounderResponse> {
  return apiClient
    .get<
      Omit<GetFounderResponse, "data"> & { data: RawFounder }
    >(`/founder/${id}`)
    .then((response) => ({
      ...response.data,
      data: normalizeFounder(response.data.data),
    }));
}

export function createFounder(
  input: CreateFounderInput,
): Promise<CreateFounderResponse> {
  return apiClient
    .post<
      Omit<CreateFounderResponse, "data"> & { data: RawFounder }
    >("/founder", input)
    .then((response) => ({
      ...response.data,
      data: normalizeFounder(response.data.data),
    }));
}

export function updateFounder(
  id: string,
  input: UpdateFounderInput,
): Promise<UpdateFounderResponse> {
  return apiClient
    .patch<
      Omit<UpdateFounderResponse, "data"> & { data: RawFounder }
    >(`/founder/${id}`, input)
    .then((response) => ({
      ...response.data,
      data: normalizeFounder(response.data.data),
    }));
}

export function deleteFounder(id: string): Promise<DeleteFounderResponse> {
  return apiClient
    .delete<DeleteFounderResponse>(`/founder/${id}`)
    .then((response) => response.data);
}
