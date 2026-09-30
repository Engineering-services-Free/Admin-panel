import { useEffect, useState, type FormEvent } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { RichTextEditor } from "@/components/rich-text-editor";

import { uploadImage } from "@/api/uploads.api";

import type { CreateAboutInput } from "@/typings/about.typings";

interface AboutFormProps {
  initialValues?: Partial<CreateAboutInput>;
  isSubmitting: boolean;
  onSubmit: (values: CreateAboutInput) => void;
  onCancel: () => void;
  onUploadingChange?: (isUploading: boolean) => void;
}

const DEFAULT_VALUES: CreateAboutInput = {
  heroImage: {
    url: "",
    alt: "",
  },
  overview: "",
  aboutUs: "",
};

export function AboutForm({
  initialValues,
  isSubmitting,
  onSubmit,
  onUploadingChange,
}: AboutFormProps) {
  const [formValues, setFormValues] = useState<CreateAboutInput>({
    ...DEFAULT_VALUES,
    ...initialValues,
    heroImage: {
      ...DEFAULT_VALUES.heroImage,
      ...initialValues?.heroImage,
    },
  });

  const [isUploadingHeroImage, setIsUploadingHeroImage] = useState(false);
  const [heroImageError, setHeroImageError] = useState<string | null>(null);

  // Let the page header know when an upload is running
  useEffect(() => {
    onUploadingChange?.(isUploadingHeroImage);
  }, [isUploadingHeroImage, onUploadingChange]);

  const handleHeroImageUpload = async (file: File) => {
    try {
      setHeroImageError(null);
      setIsUploadingHeroImage(true);

      const uploadedImage = await uploadImage(file, "about");

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

    // Don't submit while an image is still uploading
    if (isUploadingHeroImage) {
      return;
    }

    onSubmit({
      heroImage: {
        url: formValues.heroImage.url,
        alt: formValues.heroImage.alt,
        storagePath: formValues.heroImage.storagePath,
      },
      overview: formValues.overview.trim(),
      aboutUs: formValues.aboutUs,
    });
  };

  const isFormSubmitting = isSubmitting || isUploadingHeroImage;

  return (
    <form id="about-form" onSubmit={handleSubmit} className="space-y-6">
      {/* ======================================================
          HERO IMAGE
      ====================================================== */}

      <section className="rounded-lg border">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold">Hero Image</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Upload the main image for the About page.
          </p>
        </div>

        <div className="grid gap-6 p-6">
          {/* Image Upload */}
          <div className="grid gap-2">
            <Label htmlFor="about-hero-image">Image</Label>

            <Input
              id="about-hero-image"
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

          {/* Image Preview */}
          {formValues.heroImage.url && (
            <div className="overflow-hidden rounded-lg border">
              <img
                src={formValues.heroImage.url}
                alt={formValues.heroImage.alt || "About hero image"}
                className="h-72 w-full object-cover"
              />
            </div>
          )}

          {/* Alt Text */}
          <div className="grid gap-2">
            <Label htmlFor="about-hero-alt">Alt Text</Label>

            <Input
              id="about-hero-alt"
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

            <p className="text-xs text-muted-foreground">
              Alternative text for accessibility and SEO.
            </p>
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
            Provide a short overview of your company.
          </p>
        </div>

        <div className="p-6">
          <Textarea
            id="about-overview"
            value={formValues.overview}
            onChange={(event) =>
              setFormValues((current) => ({
                ...current,
                overview: event.target.value,
              }))
            }
            placeholder="Write a short overview of your company..."
            rows={7}
            disabled={isFormSubmitting}
          />
        </div>
      </section>

      {/* ======================================================
          ABOUT US
      ====================================================== */}

      <section className="rounded-lg border">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold">About Us</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Detailed information about the company.
          </p>
        </div>

        <div className="p-6">
          <RichTextEditor
            value={formValues.aboutUs}
            onChange={(value) =>
              setFormValues((current) => ({
                ...current,
                aboutUs: value,
              }))
            }
            placeholder="Write detailed information about your company..."
            disabled={isFormSubmitting}
          />
        </div>
      </section>
    </form>
  );
}
