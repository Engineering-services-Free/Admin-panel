import { apiClient } from "./client";

import type {
  Client,
  CreateClientInput,
  CreateClientResponse,
  DeleteClientResponse,
  GetClientResponse,
  GetClientsParams,
  GetClientsResponse,
  UpdateClientInput,
  UpdateClientResponse,
} from "../typings/clients.typings";

// The API returns Mongo's `_id`. Map it to `id` here so the rest of the
// app can rely on `client.id`.
type RawClient = Omit<Client, "id"> & { id?: string; _id?: string };

function normalizeClient(raw: RawClient): Client {
  const { _id, id, ...rest } = raw;

  return { ...rest, id: id ?? _id ?? "" };
}

export function getClients(
  params?: GetClientsParams,
): Promise<GetClientsResponse> {
  return apiClient
    .get<Omit<GetClientsResponse, "data"> & { data: RawClient[] }>("/clients", {
      params,
    })
    .then((response) => ({
      ...response.data,
      data: response.data.data.map(normalizeClient),
    }));
}

export function getClientById(id: string): Promise<GetClientResponse> {
  return apiClient
    .get<Omit<GetClientResponse, "data"> & { data: RawClient }>(
      `/clients/${id}`,
    )
    .then((response) => ({
      ...response.data,
      data: normalizeClient(response.data.data),
    }));
}

export function createClient(
  input: CreateClientInput,
): Promise<CreateClientResponse> {
  return apiClient
    .post<Omit<CreateClientResponse, "data"> & { data: RawClient }>(
      "/clients",
      input,
    )
    .then((response) => ({
      ...response.data,
      data: normalizeClient(response.data.data),
    }));
}

export function updateClient(
  id: string,
  input: UpdateClientInput,
): Promise<UpdateClientResponse> {
  return apiClient
    .patch<Omit<UpdateClientResponse, "data"> & { data: RawClient }>(
      `/clients/${id}`,
      input,
    )
    .then((response) => ({
      ...response.data,
      data: normalizeClient(response.data.data),
    }));
}

export function deleteClient(id: string): Promise<DeleteClientResponse> {
  return apiClient
    .delete<DeleteClientResponse>(`/clients/${id}`)
    .then((response) => response.data);
}