export interface ClientImage {
  url: string;
  alt: string;
  storagePath?: string;
}

export interface Client {
  id: string;
  name: string;
  image: ClientImage;
  industry: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateClientInput {
  name: string;
  image: ClientImage;
  industry: string;
}

export type UpdateClientInput = Partial<CreateClientInput>;

export interface GetClientsParams {
  page?: number;
  limit?: number;
  industry?: string;
}

export interface ClientPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface GetClientsResponse {
  success: true;
  data: Client[];
  pagination: ClientPagination;
}

export interface GetClientResponse {
  success: true;
  data: Client;
}

export interface CreateClientResponse {
  success: true;
  data: Client;
}

export interface UpdateClientResponse {
  success: true;
  data: Client;
}

export interface DeleteClientResponse {
  success: true;
  message?: string;
}
