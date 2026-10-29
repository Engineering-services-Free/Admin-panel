import {
  isPersistenceFieldRequired,
  type PersistenceEntity,
} from "../../../Api-processor/src/persistance/required-fields";

const labelFields: Record<
  string,
  { entity: PersistenceEntity; field: string }
> = {
  "about-hero-image": { entity: "about", field: "heroImage" },
  "about-hero-alt": { entity: "about", field: "heroImage.alt" },
  "blog-title": { entity: "blog", field: "title" },
  "blog-slug": { entity: "blog", field: "slug" },
  "blog-project": { entity: "blog", field: "projectId" },
  "blog-reading-time": { entity: "blog", field: "readingTime" },
  "blog-cover": { entity: "blog", field: "coverImage" },
  "blog-cover-alt": { entity: "blog", field: "coverImage.alt" },
  "client-name": { entity: "client", field: "name" },
  "client-industry": { entity: "client", field: "industry" },
  "client-image": { entity: "client", field: "image" },
  "client-image-alt": { entity: "client", field: "image.alt" },
  "contact-number-1": { entity: "contact", field: "contactNumber1" },
  "contact-whatsapp": { entity: "contact", field: "whatsappNumber" },
  "contact-email": { entity: "contact", field: "email" },
  "contact-map-url": { entity: "contact", field: "location.mapUrl" },
  "document-title": { entity: "document", field: "title" },
  "document-type": { entity: "document", field: "type" },
  "document-visibility": { entity: "document", field: "visibility" },
  "document-file": { entity: "document", field: "file" },
  "founder-name": { entity: "founder", field: "name" },
  "founder-order": { entity: "founder", field: "order" },
  "founder-image": { entity: "founder", field: "image" },
  "founder-image-alt": { entity: "founder", field: "image.alt" },
  "landing-hero-title": { entity: "landingPage", field: "hero.title" },
  email: { entity: "auth", field: "email" },
  password: { entity: "auth", field: "password" },
  currentPassword: { entity: "auth", field: "currentPassword" },
  newPassword: { entity: "auth", field: "newPassword" },
  "project-title": { entity: "project", field: "title" },
  "project-slug": { entity: "project", field: "slug" },
  "project-client": { entity: "project", field: "clientId" },
  "project-industry": { entity: "project", field: "industry" },
  "project-year": { entity: "project", field: "year" },
  "project-hero": { entity: "project", field: "heroImage" },
  "project-hero-alt": { entity: "project", field: "heroImage.alt" },
  "service-title": { entity: "service", field: "title" },
  "service-slug": { entity: "service", field: "slug" },
  "service-short-description": {
    entity: "service",
    field: "shortDescription",
  },
  "service-hero-image": { entity: "service", field: "heroImage" },
  "service-hero-alt": { entity: "service", field: "heroImage.alt" },
};

export function isRequiredPersistenceLabel(id?: string): boolean {
  if (!id) {
    return false;
  }

  const field =
    labelFields[id] ??
    (id.startsWith("social-platform-")
      ? { entity: "contact" as const, field: "socialMedia.platform" }
      : id.startsWith("social-url-")
        ? { entity: "contact" as const, field: "socialMedia.url" }
        : id.startsWith("service-capability-title-")
          ? { entity: "service" as const, field: "capabilities.title" }
          : id.startsWith("service-capability-description-")
            ? {
                entity: "service" as const,
                field: "capabilities.description",
              }
            : id.startsWith("service-process-step-")
              ? { entity: "service" as const, field: "process.step" }
              : id.startsWith("service-process-title-")
                ? { entity: "service" as const, field: "process.title" }
                : id.startsWith("service-process-description-")
                  ? {
                      entity: "service" as const,
                      field: "process.description",
                    }
                  : id.startsWith("service-faq-question-")
                    ? { entity: "service" as const, field: "faqs.question" }
                    : id.startsWith("service-faq-answer-")
                      ? { entity: "service" as const, field: "faqs.answer" }
                      : undefined);

  return field
    ? isPersistenceFieldRequired(field.entity, field.field)
    : false;
}

export function isRequiredPersistenceField(
  entity: PersistenceEntity,
  field: string,
): boolean {
  return isPersistenceFieldRequired(entity, field);
}
