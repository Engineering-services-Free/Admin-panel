export type ServiceStatus = "draft" | "published" | "archived";

export interface ServiceImage {
  url: string;
  alt: string;
  storagePath?: string;
}

export interface ServiceCapability {
  title: string;
  description: string;
  icon?: string;
}

export interface ServiceProcessStep {
  step: number;
  title: string;
  description: string;
}

export interface ServiceFaq {
  question: string;
  answer: string;
}

export interface ServiceSeo {
  metaTitle?: string;
  metaDescription?: string;
  keywords: string[];
}

export interface Service {
  id: string;
  title: string;
  slug: string;
  tagline?: string;
  shortDescription: string;

  heroImage: ServiceImage;

  summary: string[];
  overview: string;
  detail: string;

  capabilities: ServiceCapability[];
  technologies: string[];
  industries: string[];
  deliverables: string[];

  process: ServiceProcessStep[];

  benefits: string[];

  faqs: ServiceFaq[];

  status: ServiceStatus;
  featured: boolean;
  order: number;

  seo: ServiceSeo;

  createdAt?: string;
  updatedAt?: string;
}

export interface CreateServiceInput {
  title: string;
  slug: string;
  tagline?: string;
  shortDescription: string;

  heroImage: ServiceImage;

  summary: string[];
  overview: string;
  detail: string;

  capabilities: ServiceCapability[];
  technologies: string[];
  industries: string[];
  deliverables: string[];

  process: ServiceProcessStep[];

  benefits: string[];

  faqs: ServiceFaq[];

  status: ServiceStatus;
  featured: boolean;
  order: number;

  seo: ServiceSeo;
}

export type UpdateServiceInput = Partial<CreateServiceInput>;

export interface GetServicesParams {
  page?: number;
  limit?: number;
  status?: ServiceStatus;
  featured?: boolean;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface GetServicesResponse {
  success: true;
  data: Service[];
  pagination: Pagination;
}

export interface GetServiceResponse {
  success: true;
  data: Service;
}

export interface CreateServiceResponse {
  success: true;
  data: Service;
}

export interface UpdateServiceResponse {
  success: true;
  data: Service;
}

export interface DeleteServiceResponse {
  success: true;
  message?: string;
}
