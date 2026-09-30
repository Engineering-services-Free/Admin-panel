export interface FounderImage {
  url: string;
  alt: string;
  storagePath?: string;
}

export interface Founder {
  id: string;

  name: string;

  image: FounderImage;

  overview: string;

  experience: string;

  order: number;

  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFounderInput {
  name: string;

  image: FounderImage;

  overview: string;

  experience: string;

  order: number;
}

export type UpdateFounderInput = Partial<CreateFounderInput>;

export interface GetFoundersResponse {
  success: true;
  data: Founder[];
}

export interface GetFounderResponse {
  success: true;
  data: Founder;
}

export interface CreateFounderResponse {
  success: true;
  data: Founder;
}

export interface UpdateFounderResponse {
  success: true;
  data: Founder;
}

export interface DeleteFounderResponse {
  success: true;
  message?: string;
}
