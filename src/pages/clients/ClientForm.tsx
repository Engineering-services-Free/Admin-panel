import { useEffect, useState, type FormEvent } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { uploadImage } from "@/api/uploads.api";

import type { CreateClientInput } from "@/typings/clients.typings";

interface ClientFormProps {
  initialValues?: Partial<CreateClientInput>;
  isSubmitting: boolean;
  onSubmit: (values: CreateClientInput) => void;
  onUploadingChange?: (isUploading: boolean) => void;
}

const DEFAULT_VALUES: CreateClientInput = {
  name: "",
  industry: "",
  image: {
    url: "",
    alt: "",
  },
};

export function ClientForm({
  initialValues,
  isSubmitting,
  onSubmit,
  onUploadingChange,
}: ClientFormProps) {
  const [formValues, setFormValues] = useState<CreateClientInput>({
    ...DEFAULT_VALUES,
    ...initialValues,
    image: {
      ...DEFAULT_VALUES.image,
      ...initialValues?.image,
    },
  });

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    onUploadingChange?.(isUploadingImage);
  }, [isUploadingImage, onUploadingChange]);

  const handleImageUpload = async (file: File) => {
    try {
      setImageError(null);
      setIsUploadingImage(true);

      const uploaded = await uploadImage(file, "clients");

      setFormValues((current) => ({
        ...current,
        image: {
          url: uploaded.url,
          storagePath: uploaded.storagePath,
          alt: current.image.alt,
        },
      }));
    } catch (error) {
      setImageError(
        error instanceof Error ? error.message : "Failed to upload image.",
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isUploadingImage) {
      return;
    }

    if (!formValues.image.url) {
      setImageError("Please upload a client logo.");
      return;
    }

    const name = formValues.name.trim();

    onSubmit({
      name,
      industry: formValues.industry.trim(),
      image: {
        url: formValues.image.url,
        // The API requires alt text, so fall back to "<name> logo"
        alt: formValues.image.alt.trim() || `${name} logo`,
        storagePath: formValues.image.storagePath,
      },
    });
  };

  const isFormDisabled = isSubmitting || isUploadingImage;

  return (
    <form id="client-form" onSubmit={handleSubmit} className="space-y-6">
      {/* ======================================================
          DETAILS
      ====================================================== */}

      <section className="rounded-lg border">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold">Client Details</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            The client name and the industry they work in.
          </p>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="client-name">Name</Label>

            <Input
              id="client-name"
              value={formValues.name}
              onChange={(event) =>
                setFormValues((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              placeholder="Client name"
              maxLength={200}
              required
              disabled={isFormDisabled}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="client-industry">Industry</Label>

            <Input
              id="client-industry"
              value={formValues.industry}
              onChange={(event) =>
                setFormValues((current) => ({
                  ...current,
                  industry: event.target.value,
                }))
              }
              placeholder="e.g. Manufacturing"
              maxLength={150}
              required
              disabled={isFormDisabled}
            />
          </div>
        </div>
      </section>

      {/* ======================================================
          LOGO
      ====================================================== */}

      <section className="rounded-lg border">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold">Client Logo</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Upload the client's logo.
          </p>
        </div>

        <div className="grid gap-6 p-6">
          <div className="grid gap-2">
            <Label htmlFor="client-image">Image</Label>

            <Input
              id="client-image"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              disabled={isFormDisabled}
              onChange={(event) => {
                const file = event.target.files?.[0];

                if (!file) {
                  return;
                }

                void handleImageUpload(file);

                event.target.value = "";
              }}
            />

            <p className="text-xs text-muted-foreground">
              JPG, PNG, WEBP or GIF. Maximum 5 MB.
            </p>
          </div>

          {imageError && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3">
              <p className="text-sm text-destructive">{imageError}</p>
            </div>
          )}

          {isUploadingImage && (
            <div className="rounded-md border p-4">
              <p className="text-sm text-muted-foreground">
                Uploading image...
              </p>
            </div>
          )}

          {formValues.image.url && (
            <div className="flex h-48 items-center justify-center overflow-hidden rounded-lg border bg-muted/40 p-4">
              <img
                src={formValues.image.url}
                alt={formValues.image.alt || "Client logo"}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="client-image-alt">Alt Text</Label>

            <Input
              id="client-image-alt"
              value={formValues.image.alt}
              onChange={(event) =>
                setFormValues((current) => ({
                  ...current,
                  image: { ...current.image, alt: event.target.value },
                }))
              }
              placeholder="Describe the logo"
              maxLength={200}
              disabled={isFormDisabled}
            />

            <p className="text-xs text-muted-foreground">
              Optional. If left empty, "&lt;client name&gt; logo" is used.
            </p>
          </div>
        </div>
      </section>
    </form>
  );
}
