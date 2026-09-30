export type ProjectStatus = "draft" | "published" | "archived";

export interface ProjectImage {
  url: string;
  alt: string;
  storagePath?: string;
}

export interface ProjectResult {
  metric: string;
  value: string;
  description?: string;
}

export interface ProjectSeo {
  metaTitle?: string;
  metaDescription?: string;
  keywords: string[];
}

export interface Project {
  id: string;

  title: string;
  slug: string;

  clientId: string;
  industry: string;
  location?: string;

  shortDescription: string;
  overview: string;

  heroImage: ProjectImage;
  gallery: ProjectImage[];

  challenge: string;
  solution: string;

  engineeringScope: string[];
  technologies: string[];

  results: ProjectResult[];

  duration?: string;
  year: number;

  status: ProjectStatus;
  featured: boolean;
  order: number;

  relatedServices: string[];

  seo: ProjectSeo;

  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProjectInput {
  title: string;
  slug: string;

  clientId: string;
  industry: string;
  location?: string;

  shortDescription: string;
  overview: string;

  heroImage: ProjectImage;
  gallery: ProjectImage[];

  challenge: string;
  solution: string;

  engineeringScope: string[];
  technologies: string[];

  results: ProjectResult[];

  duration?: string;
  year: number;

  status: ProjectStatus;
  featured: boolean;
  order: number;

  relatedServices: string[];

  seo: ProjectSeo;
}

export type UpdateProjectInput = Partial<CreateProjectInput>;

export interface GetProjectsParams {
  page?: number;
  limit?: number;
  status?: ProjectStatus;
  featured?: boolean;
  industry?: string;
}

export interface ProjectPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface GetProjectsResponse {
  success: true;
  data: Project[];
  pagination: ProjectPagination;
}

export interface GetProjectResponse {
  success: true;
  data: Project;
}

export interface CreateProjectResponse {
  success: true;
  data: Project;
}

export interface UpdateProjectResponse {
  success: true;
  data: Project;
}

export interface DeleteProjectResponse {
  success: true;
  message?: string;
}
