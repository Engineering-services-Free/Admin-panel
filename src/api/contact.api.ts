import { apiClient } from "./client";

import type {
  Contact,
  CreateContactInput,
  CreateContactResponse,
  DeleteContactResponse,
  GetContactResponse,
  UpdateContactInput,
  UpdateContactResponse,
} from "../typings/contact.typings";

type RawContact = Omit<Contact, "id"> & { id?: string; _id?: string };

function normalizeContact(raw: RawContact): Contact {
  const { _id, id, ...rest } = raw;

  return { ...rest, id: id ?? _id ?? "" };
}

export function getContact(): Promise<GetContactResponse> {
  return apiClient
    .get<
      Omit<GetContactResponse, "data"> & { data: RawContact | null }
    >("/contact")
    .then((response) => ({
      ...response.data,
      data: response.data.data ? normalizeContact(response.data.data) : null,
    }));
}

export function createContact(
  input: CreateContactInput,
): Promise<CreateContactResponse> {
  return apiClient
    .post<
      Omit<CreateContactResponse, "data"> & { data: RawContact }
    >("/contact", input)
    .then((response) => ({
      ...response.data,
      data: normalizeContact(response.data.data),
    }));
}

export function updateContact(
  input: UpdateContactInput,
): Promise<UpdateContactResponse> {
  return apiClient
    .patch<
      Omit<UpdateContactResponse, "data"> & { data: RawContact }
    >("/contact", input)
    .then((response) => ({
      ...response.data,
      data: normalizeContact(response.data.data),
    }));
}

export function deleteContact(): Promise<DeleteContactResponse> {
  return apiClient
    .delete<DeleteContactResponse>("/contact")
    .then((response) => response.data);
}
