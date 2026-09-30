export interface AboutImage {
  url: string;
  alt: string;
  storagePath?: string;
}

export interface About {
  id: string;

  heroImage: AboutImage;

  overview: string;

  aboutUs: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAboutInput {
  heroImage: AboutImage;

  overview: string;

  aboutUs: string;
}

export type UpdateAboutInput = Partial<CreateAboutInput>;

export interface GetAboutResponse {
  success: true;
  data: About;
}

export interface CreateAboutResponse {
  success: true;
  data: About;
}

export interface UpdateAboutResponse {
  success: true;
  data: About;
}

export interface DeleteAboutResponse {
  success: true;
  message?: string;
}
