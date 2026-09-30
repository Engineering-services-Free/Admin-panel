import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { RichTextEditor } from "@/components/rich-text-editor";

import { uploadImage } from "@/api/uploads.api";

import type {
  CreateServiceInput,
  ServiceCapability,
  ServiceFaq,
  ServiceProcessStep,
} from "@/typings/services.typings";

import { DynamicStringList } from "./components/DynamicStringList";

interface ServiceFormProps {
  initialValues?: Partial<CreateServiceInput>;
  isSubmitting: boolean;
  onSubmit: (values: CreateServiceInput) => void;
  onCancel: () => void;
}

const DEFAULT_VALUES: CreateServiceInput = {
  title: "",
  slug: "",
  tagline: "",
  shortDescription: "",

  heroImage: {
    url: "",
    alt: "",
  },

  summary: [],
  overview: "",
  detail: "",

  capabilities: [],
  technologies: [],
  industries: [],
  deliverables: [],

  process: [],

  benefits: [],

  faqs: [],

  status: "draft",
  featured: false,
  order: 0,

  seo: {
    metaTitle: "",
    metaDescription: "",
    keywords: [],
  },
};

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

export function ServiceForm({
  initialValues,
  isSubmitting,
  onSubmit,
  onCancel,
}: ServiceFormProps) {
  const [formValues, setFormValues] = useState<CreateServiceInput>({
    ...DEFAULT_VALUES,
    ...initialValues,

    heroImage: {
      ...DEFAULT_VALUES.heroImage,
      ...initialValues?.heroImage,
    },

    seo: {
      ...DEFAULT_VALUES.seo,
      ...initialValues?.seo,
    },
  });

  const [isUploadingHeroImage, setIsUploadingHeroImage] = useState(false);

  const [heroImageError, setHeroImageError] = useState<string | null>(null);

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(
    Boolean(initialValues?.slug),
  );

  const handleChange = (
    field: keyof CreateServiceInput,
    value: CreateServiceInput[keyof CreateServiceInput],
  ) => {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleTitleChange = (title: string) => {
    setFormValues((current) => ({
      ...current,
      title,
      slug: slugManuallyEdited ? current.slug : generateSlug(title),
    }));
  };

  const handleHeroImageUpload = async (file: File) => {
    try {
      setHeroImageError(null);
      setIsUploadingHeroImage(true);

      const uploadedImage = await uploadImage(file, "services");

      setFormValues((current) => ({
        ...current,

        heroImage: {
          url: uploadedImage.url,
          storagePath: uploadedImage.storagePath,
          alt: current.heroImage.alt,
        },
      }));
    } catch (error) {
      setHeroImageError(
        error instanceof Error ? error.message : "Failed to upload hero image.",
      );
    } finally {
      setIsUploadingHeroImage(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cleanedValues: CreateServiceInput = {
      ...formValues,

      summary: formValues.summary.filter((value) => value.trim() !== ""),

      technologies: formValues.technologies.filter(
        (value) => value.trim() !== "",
      ),

      industries: formValues.industries.filter((value) => value.trim() !== ""),

      deliverables: formValues.deliverables.filter(
        (value) => value.trim() !== "",
      ),

      benefits: formValues.benefits.filter((value) => value.trim() !== ""),

      capabilities: formValues.capabilities.filter(
        (capability) =>
          capability.title.trim() !== "" ||
          capability.description.trim() !== "",
      ),

      process: formValues.process.filter(
        (step) => step.title.trim() !== "" || step.description.trim() !== "",
      ),

      faqs: formValues.faqs.filter(
        (faq) => faq.question.trim() !== "" || faq.answer.trim() !== "",
      ),

      seo: {
        ...formValues.seo,

        keywords: formValues.seo.keywords.filter(
          (keyword) => keyword.trim() !== "",
        ),
      },
    };

    onSubmit(cleanedValues);
  };

  const isFormSubmitting = isSubmitting || isUploadingHeroImage;

  /*
   * --------------------------------------------------
   * CAPABILITIES
   * --------------------------------------------------
   */

  const handleAddCapability = () => {
    const newCapability: ServiceCapability = {
      title: "",
      description: "",
      icon: "",
    };

    setFormValues((current) => ({
      ...current,

      capabilities: [...current.capabilities, newCapability],
    }));
  };

  const handleCapabilityChange = (
    index: number,
    field: keyof ServiceCapability,
    value: string,
  ) => {
    setFormValues((current) => {
      const capabilities = [...current.capabilities];

      capabilities[index] = {
        ...capabilities[index],
        [field]: value,
      };

      return {
        ...current,
        capabilities,
      };
    });
  };

  const handleRemoveCapability = (index: number) => {
    setFormValues((current) => ({
      ...current,

      capabilities: current.capabilities.filter(
        (_, currentIndex) => currentIndex !== index,
      ),
    }));
  };

  /*
   * --------------------------------------------------
   * PROCESS
   * --------------------------------------------------
   */

  const handleAddProcessStep = () => {
    const nextStepNumber = formValues.process.length + 1;

    const newStep: ServiceProcessStep = {
      step: nextStepNumber,
      title: "",
      description: "",
    };

    setFormValues((current) => ({
      ...current,

      process: [...current.process, newStep],
    }));
  };

  const handleProcessChange = (
    index: number,
    field: keyof ServiceProcessStep,
    value: string,
  ) => {
    setFormValues((current) => {
      const process = [...current.process];

      process[index] = {
        ...process[index],

        [field]: field === "step" ? Number(value) : value,
      };

      return {
        ...current,
        process,
      };
    });
  };

  const handleRemoveProcessStep = (index: number) => {
    setFormValues((current) => ({
      ...current,

      process: current.process
        .filter((_, currentIndex) => currentIndex !== index)
        .map((step, currentIndex) => ({
          ...step,
          step: currentIndex + 1,
        })),
    }));
  };

  /*
   * --------------------------------------------------
   * FAQS
   * --------------------------------------------------
   */

  const handleAddFaq = () => {
    const newFaq: ServiceFaq = {
      question: "",
      answer: "",
    };

    setFormValues((current) => ({
      ...current,

      faqs: [...current.faqs, newFaq],
    }));
  };

  const handleFaqChange = (
    index: number,
    field: keyof ServiceFaq,
    value: string,
  ) => {
    setFormValues((current) => {
      const faqs = [...current.faqs];

      faqs[index] = {
        ...faqs[index],
        [field]: value,
      };

      return {
        ...current,
        faqs,
      };
    });
  };

  const handleRemoveFaq = (index: number) => {
    setFormValues((current) => ({
      ...current,

      faqs: current.faqs.filter((_, currentIndex) => currentIndex !== index),
    }));
  };

  /*
   * --------------------------------------------------
   * SEO KEYWORDS
   * --------------------------------------------------
   */

  const handleSeoKeywordsChange = (keywords: string[]) => {
    setFormValues((current) => ({
      ...current,

      seo: {
        ...current.seo,
        keywords,
      },
    }));
  };

  return (
    <form id="service-form" onSubmit={handleSubmit} className="space-y-6">
      {/* ======================================================
          BASIC INFORMATION
      ====================================================== */}

      <section className="rounded-lg border">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold">Basic Information</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Basic information about this service.
          </p>
        </div>

        <div className="grid gap-6 p-6">
          {/* Service Name */}

          <div className="grid gap-2">
            <Label htmlFor="service-title">Service Name</Label>

            <Input
              id="service-title"
              value={formValues.title}
              onChange={(event) => handleTitleChange(event.target.value)}
              placeholder="Enter service name"
              disabled={isFormSubmitting}
            />
          </div>

          {/* Slug */}

          <div className="grid gap-2">
            <Label htmlFor="service-slug">Slug</Label>

            <Input
              id="service-slug"
              value={formValues.slug}
              onChange={(event) => {
                setSlugManuallyEdited(true);

                setFormValues((current) => ({
                  ...current,

                  slug: generateSlug(event.target.value),
                }));
              }}
              placeholder="service-slug"
              disabled={isFormSubmitting}
            />

            <p className="text-xs text-muted-foreground">
              Automatically generated from the service name. You can edit it if
              needed.
            </p>
          </div>

          {/* Tagline */}

          <div className="grid gap-2">
            <Label htmlFor="service-tagline">Tagline</Label>

            <Input
              id="service-tagline"
              value={formValues.tagline ?? ""}
              onChange={(event) => handleChange("tagline", event.target.value)}
              placeholder="Short service tagline"
              disabled={isFormSubmitting}
            />
          </div>

          {/* Short Description */}

          <div className="grid gap-2">
            <Label htmlFor="service-short-description">Short Description</Label>

            <Textarea
              id="service-short-description"
              value={formValues.shortDescription}
              onChange={(event) =>
                handleChange("shortDescription", event.target.value)
              }
              placeholder="Brief description of the service"
              rows={4}
              disabled={isFormSubmitting}
            />
          </div>
        </div>
      </section>

      {/* ======================================================
          HERO IMAGE
      ====================================================== */}

      <section className="rounded-lg border">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold">Hero Image</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Upload the main image for this service.
          </p>
        </div>

        <div className="grid gap-6 p-6">
          {/* Upload */}

          <div className="grid gap-2">
            <Label htmlFor="service-hero-image">Image</Label>

            <Input
              id="service-hero-image"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              disabled={isFormSubmitting}
              onChange={(event) => {
                const file = event.target.files?.[0];

                if (!file) {
                  return;
                }

                void handleHeroImageUpload(file);

                event.target.value = "";
              }}
            />

            <p className="text-xs text-muted-foreground">
              JPG, PNG, WEBP or GIF. Maximum 5 MB.
            </p>
          </div>

          {/* Upload Error */}

          {heroImageError && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3">
              <p className="text-sm text-destructive">{heroImageError}</p>
            </div>
          )}

          {/* Uploading */}

          {isUploadingHeroImage && (
            <div className="rounded-md border p-4">
              <p className="text-sm text-muted-foreground">
                Uploading image...
              </p>
            </div>
          )}

          {/* Preview */}

          {formValues.heroImage.url && (
            <div className="grid gap-4">
              <div className="overflow-hidden rounded-lg border">
                <img
                  src={formValues.heroImage.url}
                  alt={
                    formValues.heroImage.alt ||
                    formValues.title ||
                    "Service hero image"
                  }
                  className="h-64 w-full object-cover"
                />
              </div>

              <p className="break-all text-xs text-muted-foreground">
                {formValues.heroImage.storagePath}
              </p>
            </div>
          )}

          {/* Alt */}

          <div className="grid gap-2">
            <Label htmlFor="service-hero-alt">Alt Text</Label>

            <Input
              id="service-hero-alt"
              value={formValues.heroImage.alt}
              onChange={(event) =>
                setFormValues((current) => ({
                  ...current,

                  heroImage: {
                    ...current.heroImage,
                    alt: event.target.value,
                  },
                }))
              }
              placeholder="Describe the image"
              disabled={isFormSubmitting}
            />
          </div>
        </div>
      </section>

      {/* ======================================================
          OVERVIEW
      ====================================================== */}

      <section className="rounded-lg border">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold">Overview</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Provide a short overview of this service.
          </p>
        </div>

        <div className="p-6">
          <Textarea
            id="service-overview"
            value={formValues.overview}
            onChange={(event) => handleChange("overview", event.target.value)}
            placeholder="Write the service overview..."
            rows={7}
            disabled={isFormSubmitting}
          />
        </div>
      </section>

      {/* ======================================================
          SUMMARY
      ====================================================== */}

      <section className="rounded-lg border">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold">Summary</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Add the key points that summarize this service.
          </p>
        </div>

        <div className="p-6">
          <DynamicStringList
            label="Summary Point"
            values={formValues.summary}
            onChange={(values) => handleChange("summary", values)}
            placeholder="Example: End-to-end Engineering Services"
            disabled={isFormSubmitting}
          />
        </div>
      </section>

      {/* ======================================================
          CAPABILITIES
      ====================================================== */}

      <section className="rounded-lg border">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold">Capabilities</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Define the main capabilities provided by this service.
          </p>
        </div>

        <div className="grid gap-6 p-6">
          {formValues.capabilities.map((capability, index) => (
            <div key={index} className="grid gap-4 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Capability {index + 1}</h3>

                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveCapability(index)}
                  disabled={isFormSubmitting}
                >
                  Remove
                </Button>
              </div>

              {/* Title */}

              <div className="grid gap-2">
                <Label>Title</Label>

                <Input
                  value={capability.title}
                  onChange={(event) =>
                    handleCapabilityChange(index, "title", event.target.value)
                  }
                  placeholder="Example: Plant Design"
                  disabled={isFormSubmitting}
                />
              </div>

              {/* Description */}

              <div className="grid gap-2">
                <Label>Description</Label>

                <Textarea
                  value={capability.description}
                  onChange={(event) =>
                    handleCapabilityChange(
                      index,
                      "description",
                      event.target.value,
                    )
                  }
                  placeholder="Describe this capability..."
                  rows={4}
                  disabled={isFormSubmitting}
                />
              </div>

              {/* Icon */}

              <div className="grid gap-2">
                <Label>Icon</Label>

                <Input
                  value={capability.icon ?? ""}
                  onChange={(event) =>
                    handleCapabilityChange(index, "icon", event.target.value)
                  }
                  placeholder="Optional icon name"
                  disabled={isFormSubmitting}
                />
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            className="w-fit"
            onClick={handleAddCapability}
            disabled={isFormSubmitting}
          >
            Add Capability
          </Button>
        </div>
      </section>

      {/* ======================================================
          TECHNOLOGIES
      ====================================================== */}

      <section className="rounded-lg border">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold">Technologies</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Technologies, tools, and platforms used for this service.
          </p>
        </div>

        <div className="p-6">
          <DynamicStringList
            label="Technology"
            values={formValues.technologies}
            onChange={(values) => handleChange("technologies", values)}
            placeholder="Example: AutoCAD"
            disabled={isFormSubmitting}
          />
        </div>
      </section>

      {/* ======================================================
          INDUSTRIES
      ====================================================== */}

      <section className="rounded-lg border">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold">Industries</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Industries where this service is applicable.
          </p>
        </div>

        <div className="p-6">
          <DynamicStringList
            label="Industry"
            values={formValues.industries}
            onChange={(values) => handleChange("industries", values)}
            placeholder="Example: Renewable Energy"
            disabled={isFormSubmitting}
          />
        </div>
      </section>

      {/* ======================================================
          DELIVERABLES
      ====================================================== */}

      <section className="rounded-lg border">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold">Deliverables</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Documents, designs, reports, or other outputs delivered to the
            client.
          </p>
        </div>

        <div className="p-6">
          <DynamicStringList
            label="Deliverable"
            values={formValues.deliverables}
            onChange={(values) => handleChange("deliverables", values)}
            placeholder="Example: Engineering drawings"
            disabled={isFormSubmitting}
          />
        </div>
      </section>

      {/* ======================================================
          PROCESS
      ====================================================== */}

      <section className="rounded-lg border">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold">Process</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Define the steps involved in delivering this service.
          </p>
        </div>

        <div className="grid gap-6 p-6">
          {formValues.process.map((processStep, index) => (
            <div key={index} className="grid gap-4 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Step {index + 1}</h3>

                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveProcessStep(index)}
                  disabled={isFormSubmitting}
                >
                  Remove
                </Button>
              </div>

              {/* Step Number */}

              <div className="grid gap-2">
                <Label>Step Number</Label>

                <Input
                  type="number"
                  min={1}
                  value={processStep.step}
                  onChange={(event) =>
                    handleProcessChange(index, "step", event.target.value)
                  }
                  disabled={isFormSubmitting}
                />
              </div>

              {/* Title */}

              <div className="grid gap-2">
                <Label>Title</Label>

                <Input
                  value={processStep.title}
                  onChange={(event) =>
                    handleProcessChange(index, "title", event.target.value)
                  }
                  placeholder="Example: Requirement Analysis"
                  disabled={isFormSubmitting}
                />
              </div>

              {/* Description */}

              <div className="grid gap-2">
                <Label>Description</Label>

                <Textarea
                  value={processStep.description}
                  onChange={(event) =>
                    handleProcessChange(
                      index,
                      "description",
                      event.target.value,
                    )
                  }
                  placeholder="Describe this process step..."
                  rows={4}
                  disabled={isFormSubmitting}
                />
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            className="w-fit"
            onClick={handleAddProcessStep}
            disabled={isFormSubmitting}
          >
            Add Process Step
          </Button>
        </div>
      </section>

      {/* ======================================================
          BENEFITS
      ====================================================== */}

      <section className="rounded-lg border">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold">Benefits</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Key benefits clients receive from this service.
          </p>
        </div>

        <div className="p-6">
          <DynamicStringList
            label="Benefit"
            values={formValues.benefits}
            onChange={(values) => handleChange("benefits", values)}
            placeholder="Example: Reduced engineering time"
            disabled={isFormSubmitting}
          />
        </div>
      </section>

      {/* ======================================================
          FAQS
      ====================================================== */}

      <section className="rounded-lg border">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold">FAQs</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Frequently asked questions about this service.
          </p>
        </div>

        <div className="grid gap-6 p-6">
          {formValues.faqs.map((faq, index) => (
            <div key={index} className="grid gap-4 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">FAQ {index + 1}</h3>

                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveFaq(index)}
                  disabled={isFormSubmitting}
                >
                  Remove
                </Button>
              </div>

              {/* Question */}

              <div className="grid gap-2">
                <Label>Question</Label>

                <Input
                  value={faq.question}
                  onChange={(event) =>
                    handleFaqChange(index, "question", event.target.value)
                  }
                  placeholder="Example: What does this service include?"
                  disabled={isFormSubmitting}
                />
              </div>

              {/* Answer */}

              <div className="grid gap-2">
                <Label>Answer</Label>

                <Textarea
                  value={faq.answer}
                  onChange={(event) =>
                    handleFaqChange(index, "answer", event.target.value)
                  }
                  placeholder="Write the answer..."
                  rows={4}
                  disabled={isFormSubmitting}
                />
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            className="w-fit"
            onClick={handleAddFaq}
            disabled={isFormSubmitting}
          >
            Add FAQ
          </Button>
        </div>
      </section>

      {/* ======================================================
          DETAIL
      ====================================================== */}

      <section className="rounded-lg border">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold">Detailed Content</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Add the complete detailed content for this service.
          </p>
        </div>

        <div className="p-6">
          <RichTextEditor
            value={formValues.detail}
            onChange={(value) => handleChange("detail", value)}
            placeholder="Write detailed service content..."
            disabled={isFormSubmitting}
          />
        </div>
      </section>

      {/* ======================================================
          SEO
      ====================================================== */}

      <section className="rounded-lg border">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold">SEO</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Search engine metadata for this service.
          </p>
        </div>

        <div className="grid gap-6 p-6">
          {/* Meta Title */}

          <div className="grid gap-2">
            <Label htmlFor="service-meta-title">Meta Title</Label>

            <Input
              id="service-meta-title"
              value={formValues.seo.metaTitle ?? ""}
              onChange={(event) =>
                setFormValues((current) => ({
                  ...current,

                  seo: {
                    ...current.seo,
                    metaTitle: event.target.value,
                  },
                }))
              }
              placeholder="SEO title"
              disabled={isFormSubmitting}
            />
          </div>

          {/* Meta Description */}

          <div className="grid gap-2">
            <Label htmlFor="service-meta-description">Meta Description</Label>

            <Textarea
              id="service-meta-description"
              value={formValues.seo.metaDescription ?? ""}
              onChange={(event) =>
                setFormValues((current) => ({
                  ...current,

                  seo: {
                    ...current.seo,
                    metaDescription: event.target.value,
                  },
                }))
              }
              placeholder="SEO description"
              rows={4}
              disabled={isFormSubmitting}
            />
          </div>

          {/* Keywords */}

          <DynamicStringList
            label="Keyword"
            values={formValues.seo.keywords}
            onChange={handleSeoKeywordsChange}
            placeholder="Example: solar engineering"
            disabled={isFormSubmitting}
          />
        </div>
      </section>

      {/* ======================================================
          PUBLISHING
      ====================================================== */}

      <section className="rounded-lg border">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold">Publishing</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Control the visibility and ordering of this service.
          </p>
        </div>

        <div className="grid gap-6 p-6">
          {/* Status */}

          <div className="grid gap-2">
            <Label htmlFor="service-status">Status</Label>

            <select
              id="service-status"
              value={formValues.status}
              onChange={(event) =>
                handleChange(
                  "status",
                  event.target.value as CreateServiceInput["status"],
                )
              }
              disabled={isFormSubmitting}
              className="h-9 w-full rounded-md border bg-background px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="draft">Draft</option>

              <option value="published">Published</option>

              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Featured */}

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label>Featured Service</Label>

              <p className="mt-1 text-xs text-muted-foreground">
                Display this service as a featured service on the website.
              </p>
            </div>

            <input
              type="checkbox"
              checked={formValues.featured}
              onChange={(event) =>
                handleChange("featured", event.target.checked)
              }
              disabled={isFormSubmitting}
              className="size-4"
            />
          </div>

          {/* Order */}

          <div className="grid gap-2">
            <Label htmlFor="service-order">Display Order</Label>

            <Input
              id="service-order"
              type="number"
              min={0}
              value={formValues.order}
              onChange={(event) =>
                handleChange("order", Number(event.target.value))
              }
              disabled={isFormSubmitting}
            />

            <p className="text-xs text-muted-foreground">
              Lower numbers appear first.
            </p>
          </div>
        </div>
      </section>

      {/* ======================================================
          ACTIONS
      ====================================================== */}

      {/* <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isFormSubmitting}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={isFormSubmitting || !formValues.heroImage.url}
        >
          {isUploadingHeroImage
            ? "Uploading..."
            : isSubmitting
              ? "Saving..."
              : "Save Service"}
        </Button>
      </div> */}
    </form>
  );
}
