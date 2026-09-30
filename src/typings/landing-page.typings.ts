export interface LandingHero {
  title: string;
  description?: string;
}

export interface LandingPage {
  id: string;

  hero: LandingHero;

  whatWeDo: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface CreateLandingPageInput {
  hero: LandingHero;

  whatWeDo: string;
}

export type UpdateLandingPageInput = Partial<CreateLandingPageInput>;

export interface GetLandingPageResponse {
  success: true;
  data: LandingPage | null;
}

export interface CreateLandingPageResponse {
  success: true;
  data: LandingPage;
}

export interface UpdateLandingPageResponse {
  success: true;
  data: LandingPage;
}

export interface DeleteLandingPageResponse {
  success: true;
  message?: string;
}
