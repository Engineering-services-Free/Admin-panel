export type BlogStatus = "draft" | "published" | "archived";

export interface BlogImage {
  url: string;
  alt: string;
  storagePath?: string;
}

export interface BlogSeo {
  metaTitle?: string;
  metaDescription?: string;
  keywords: string[];
}

export interface Blog {
  id: string;

  title: string;
  slug: string;

  shortDescription: string;
  overview: string;

  coverImage: BlogImage;

  content: string;

  projectId: string;

  technologies: string[];
  keyTakeaways: string[];

  readingTime: number;

  status: BlogStatus;
  featured: boolean;
  order: number;

  publishedAt?: string;

  seo: BlogSeo;

  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBlogInput {
  title: string;
  slug: string;

  shortDescription: string;
  overview: string;

  coverImage: BlogImage;

  content: string;

  projectId: string;

  technologies: string[];
  keyTakeaways: string[];

  readingTime: number;

  status: BlogStatus;
  featured: boolean;
  order: number;

  publishedAt?: string;

  seo: BlogSeo;
}

export type UpdateBlogInput = Partial<CreateBlogInput>;

export interface GetBlogsParams {
  page?: number;
  limit?: number;
  status?: BlogStatus;
  featured?: boolean;
  projectId?: string;
}

export interface BlogPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface GetBlogsResponse {
  success: true;
  data: Blog[];
  pagination: BlogPagination;
}

export interface GetBlogResponse {
  success: true;
  data: Blog;
}

export interface CreateBlogResponse {
  success: true;
  data: Blog;
}

export interface UpdateBlogResponse {
  success: true;
  data: Blog;
}

export interface DeleteBlogResponse {
  success: true;
  message?: string;
}
