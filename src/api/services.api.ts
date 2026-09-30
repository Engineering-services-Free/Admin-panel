import { apiClient } from "./client";

import type {
  CreateServiceInput,
  CreateServiceResponse,
  DeleteServiceResponse,
  GetServiceResponse,
  GetServicesParams,
  GetServicesResponse,
  UpdateServiceInput,
  UpdateServiceResponse,
} from "../typings/services.typings";

export function getServices(
  params?: GetServicesParams,
): Promise<GetServicesResponse> {
  return apiClient
    .get<GetServicesResponse>("/services", {
      params,
    })
    .then((response) => response.data);
}

export function getServiceById(id: string): Promise<GetServiceResponse> {
  return apiClient
    .get<GetServiceResponse>(`/services/${id}`)
    .then((response) => response.data);
}

export function getServiceBySlug(slug: string): Promise<GetServiceResponse> {
  return apiClient
    .get<GetServiceResponse>(`/services/slug/${slug}`)
    .then((response) => response.data);
}

export function createService(
  input: CreateServiceInput,
): Promise<CreateServiceResponse> {
  return apiClient
    .post<CreateServiceResponse>("/services", input)
    .then((response) => response.data);
}

export function updateService(
  id: string,
  input: UpdateServiceInput,
): Promise<UpdateServiceResponse> {
  return apiClient
    .patch<UpdateServiceResponse>(`/services/${id}`, input)
    .then((response) => response.data);
}

export function deleteService(id: string): Promise<DeleteServiceResponse> {
  return apiClient
    .delete<DeleteServiceResponse>(`/services/${id}`)
    .then((response) => response.data);
}
