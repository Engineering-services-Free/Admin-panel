export interface ContactSocialMedia {
  platform: string;
  url: string;
}

export interface ContactLocation {
  mapUrl: string;
}

export interface Contact {
  id: string;

  contactNumber1: string;

  contactNumber2?: string;

  whatsappNumber: string;

  email: string;

  socialMedia: ContactSocialMedia[];

  location: ContactLocation;

  createdAt?: string;
  updatedAt?: string;
}

export interface CreateContactInput {
  contactNumber1: string;

  contactNumber2?: string;

  whatsappNumber: string;

  email: string;

  socialMedia: ContactSocialMedia[];

  location: ContactLocation;
}

export type UpdateContactInput = Partial<CreateContactInput>;

export interface GetContactResponse {
  success: true;
  data: Contact | null;
}

export interface CreateContactResponse {
  success: true;
  data: Contact;
}

export interface UpdateContactResponse {
  success: true;
  data: Contact;
}

export interface DeleteContactResponse {
  success: true;
  message?: string;
}
