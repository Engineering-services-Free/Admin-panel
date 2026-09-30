import { useEffect, useState, type FormEvent } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { RichTextEditor } from "@/components/rich-text-editor";

import { uploadImage } from "@/api/uploads.api";

import type { CreateFounderInput } from "@/typings/founder.typings";

interface FounderFormProps {
  initialValues?: Partial<CreateFounderInput>;
  isSubmitting: boolean;
  onSubmit: (values: CreateFounderInput) => void;
  onUploadingChange?: (isUploading: boolean) => void;
}

const DEFAULT_VALUES: CreateFounderInput = {
  name: "",
  image: { url: "", alt: "" },
  overview: "",
  experience: "",
  order: 1,
};

function isRichTextEmpty(html: string) {
  if (/<img\s/i.test(html)) {
    return false;
  }

  return (
    html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim() === ""
  );
}

export function FounderForm({
  initialValues,
  isSubmitting,
  onSubmit,
  onUploadingChange,
}: FounderFormProps) {
  const [formValues, setFormValues] = useState<CreateFounderInput>({
    ...DEFAULT_VALUES,
    ...initialValues,
    image: {
      ...DEFAULT_VALUES.image,
      ...initialValues?.image,
    },
  });

  // Kept as a string so the field can be cleared while typing
  const [orderInput, setOrderInput] = useState(
    String(initialValues?.order ?? DEFAULT_VALUES.order),
  );

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const OVERVIEW_CHARACTER_LIMIT = 2000;
  useEffect(() => {
    onUploadingChange?.(isUploadingImage);
  }, [isUploadingImage, onUploadingChange]);

  const handleImageUpload = async (file: File) => {
    try {
      setImageError(null);
      setIsUploadingImage(true);

      const uploaded = await uploadImage(file, "founder");

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

    setFormError(null);

    if (!formValues.image.url) {
      setImageError("Please upload a founder photo.");
      return;
    }

    const order = Number(orderInput);

    if (orderInput.trim() === "" || !Number.isInteger(order) || order < 0) {
      setFormError("Order must be a whole number, 0 or greater.");
      return;
    }

    if (isRichTextEmpty(formValues.overview)) {
      setFormError("Please add the founder's overview.");
      return;
    }

    const overviewTextLength = formValues.overview
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ").length;

    if (overviewTextLength > OVERVIEW_CHARACTER_LIMIT) {
      setFormError(
        `Overview must be ${OVERVIEW_CHARACTER_LIMIT} characters or fewer.`,
      );
      return;
    }

    if (isRichTextEmpty(formValues.experience)) {
      setFormError("Please add the founder's experience.");
      return;
    }

    const name = formValues.name.trim();

    onSubmit({
      name,
      order,
      overview: formValues.overview,
      experience: formValues.experience,
      image: {
        url: formValues.image.url,
        // The API requires alt text, so fall back to the name
        alt: formValues.image.alt.trim() || name,
        storagePath: formValues.image.storagePath,
      },
    });
  };

  const isFormDisabled = isSubmitting || isUploadingImage;

  return (
    <form id="founder-form" onSubmit={handleSubmit} className="space-y-6">
      {formError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{formError}</p>
        </div>
      )}

      {/* DETAILS */}
      <section className="rounded-lg border">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold">Founder Details</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            The founder's name and where they appear on the website.
          </p>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-[1fr_160px]">
          <div className="grid gap-2">
            <Label htmlFor="founder-name">Name</Label>

            <Input
              id="founder-name"
              value={formValues.name}
              onChange={(event) =>
                setFormValues((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              placeholder="Founder name"
              maxLength={150}
              required
              disabled={isFormDisabled}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="founder-order">Order</Label>

            <Input
              id="founder-order"
              type="number"
              min={0}
              step={1}
              value={orderInput}
              onChange={(event) => setOrderInput(event.target.value)}
              required
              disabled={isFormDisabled}
            />

            <p className="text-xs text-muted-foreground">
              Must be unique. Lower numbers show first.
            </p>
          </div>
        </div>
      </section>

      {/* PHOTO */}
      <section className="rounded-lg border">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold">Founder Photo</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Upload a photo of the founder.
          </p>
        </div>

        <div className="grid gap-6 p-6">
          <div className="grid gap-2">
            <Label htmlFor="founder-image">Image</Label>

            <Input
              id="founder-image"
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
            <div className="overflow-hidden rounded-lg border">
              <img
                src={formValues.image.url}
                alt={formValues.image.alt || "Founder photo"}
                className="h-72 w-full object-cover"
              />
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="founder-image-alt">Alt Text</Label>

            <Input
              id="founder-image-alt"
              value={formValues.image.alt}
              onChange={(event) =>
                setFormValues((current) => ({
                  ...current,
                  image: { ...current.image, alt: event.target.value },
                }))
              }
              placeholder="Describe the photo"
              maxLength={200}
              disabled={isFormDisabled}
            />

            <p className="text-xs text-muted-foreground">
              Optional. If left empty, the founder's name is used.
            </p>
          </div>
        </div>
      </section>

      {/* OVERVIEW */}
      <section className="rounded-lg border">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold">Overview</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            A short introduction to the founder.
          </p>
        </div>

        <div className="p-6">
          <RichTextEditor
            value={formValues.overview}
            onChange={(value) =>
              setFormValues((current) => ({
                ...current,
                overview: value,
              }))
            }
            placeholder="Write a short overview of the founder..."
            characterLimit={OVERVIEW_CHARACTER_LIMIT}
            minHeight={180}
            disabled={isFormDisabled}
          />
        </div>
      </section>

      {/* EXPERIENCE */}
      <section className="rounded-lg border">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold">Experience</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Detailed background and experience of the founder.
          </p>
        </div>

        <div className="p-6">
          <RichTextEditor
            value={formValues.experience}
            onChange={(value) =>
              setFormValues((current) => ({
                ...current,
                experience: value,
              }))
            }
            placeholder="Write the founder's experience..."
            disabled={isFormDisabled}
          />
        </div>
      </section>
    </form>
  );
}
