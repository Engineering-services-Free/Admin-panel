import { useEffect, useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { RichTextEditor } from "@/components/rich-text-editor";
import { TagInput } from "@/components/common/TagInput";

import { uploadImage } from "@/api/uploads.api";
import { useClients } from "@/hooks/services/useClients";
import { useServices } from "@/hooks/services/useServices";

import type {
  CreateProjectInput,
  Project,
  ProjectImage,
  ProjectResult,
  ProjectStatus,
} from "@/typings/projects.typings";

interface ProjectFormProps {
  initialValues?: Partial<Project>;
  isSubmitting: boolean;
  onSubmit: (values: CreateProjectInput) => void;
  onUploadingChange?: (isUploading: boolean) => void;
}

const MAX_GALLERY = 30;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const selectClass =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm disabled:opacity-50";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 220);
}

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

// Optional text: "" clears a value that existed before, undefined otherwise
function optionalText(value: string, hadValue: boolean) {
  const trimmed = value.trim();

  return trimmed || (hadValue ? "" : undefined);
}

// Copies only url, alt and storagePath. storagePath stays internal form data.
function cloneGallery(images?: ProjectImage[]): ProjectImage[] {
  return (images ?? []).map(({ url, alt, storagePath }) => ({
    url,
    alt: alt ?? "",
    ...(storagePath ? { storagePath } : {}),
  }));
}

export function ProjectForm({
  initialValues,
  isSubmitting,
  onSubmit,
  onUploadingChange,
}: ProjectFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [slug, setSlug] = useState(initialValues?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(false);
  const [clientId, setClientId] = useState(initialValues?.clientId ?? "");
  const [industry, setIndustry] = useState(initialValues?.industry ?? "");
  const [location, setLocation] = useState(initialValues?.location ?? "");
  const [duration, setDuration] = useState(initialValues?.duration ?? "");
  const [yearInput, setYearInput] = useState(
    String(initialValues?.year ?? new Date().getFullYear()),
  );
  const [orderInput, setOrderInput] = useState(
    String(initialValues?.order ?? 0),
  );
  const [status, setStatus] = useState<ProjectStatus>(
    initialValues?.status ?? "draft",
  );
  const [featured, setFeatured] = useState(initialValues?.featured ?? false);

  const [shortDescription, setShortDescription] = useState(
    initialValues?.shortDescription ?? "",
  );
  const [overview, setOverview] = useState(initialValues?.overview ?? "");
  const [challenge, setChallenge] = useState(initialValues?.challenge ?? "");
  const [solution, setSolution] = useState(initialValues?.solution ?? "");

  const [heroImage, setHeroImage] = useState<ProjectImage>(
    initialValues?.heroImage ?? { url: "", alt: "" },
  );

  // The complete existing gallery is loaded into state and sent back on save
  const [gallery, setGallery] = useState<ProjectImage[]>(() =>
    cloneGallery(initialValues?.gallery),
  );

  const [engineeringScope, setEngineeringScope] = useState<string[]>(
    initialValues?.engineeringScope ?? [],
  );
  const [technologies, setTechnologies] = useState<string[]>(
    initialValues?.technologies ?? [],
  );
  const [results, setResults] = useState<ProjectResult[]>(
    initialValues?.results?.map((item) => ({ ...item })) ?? [],
  );
  const [relatedServices, setRelatedServices] = useState<string[]>(
    initialValues?.relatedServices ?? [],
  );

  const [metaTitle, setMetaTitle] = useState(
    initialValues?.seo?.metaTitle ?? "",
  );
  const [metaDescription, setMetaDescription] = useState(
    initialValues?.seo?.metaDescription ?? "",
  );
  const [keywords, setKeywords] = useState<string[]>(
    initialValues?.seo?.keywords ?? [],
  );

  const [uploadCount, setUploadCount] = useState(0);
  const [heroError, setHeroError] = useState<string | null>(null);
  const [galleryError, setGalleryError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const isUploading = uploadCount > 0;
  const isFormDisabled = isSubmitting || isUploading;

  const clientsQuery = useClients({ page: 1, limit: 100 });
  const servicesQuery = useServices({ page: 1, limit: 100 });

  const clients = clientsQuery.data?.data ?? [];
  const services = servicesQuery.data?.data ?? [];

  useEffect(() => {
    onUploadingChange?.(isUploading);
  }, [isUploading, onUploadingChange]);

  const handleTitleChange = (value: string) => {
    setTitle(value);

    if (!slugTouched) {
      setSlug(slugify(value));
    }
  };

  const uploadOne = async (file: File) => {
    setUploadCount((count) => count + 1);

    try {
      return await uploadImage(file, "projects");
    } finally {
      setUploadCount((count) => count - 1);
    }
  };

  const handleHeroUpload = async (file: File) => {
    try {
      setHeroError(null);

      const uploaded = await uploadOne(file);

      setHeroImage((current) => ({
        url: uploaded.url,
        storagePath: uploaded.storagePath,
        alt: current.alt,
      }));
    } catch (error) {
      setHeroError(
        error instanceof Error ? error.message : "Failed to upload image.",
      );
    }
  };

  const handleGalleryUpload = async (files: File[]) => {
    setGalleryError(null);

    const room = MAX_GALLERY - gallery.length;

    if (files.length > room) {
      setGalleryError(
        `Only ${room} more image(s) can be added (maximum ${MAX_GALLERY}).`,
      );
    }

    for (const file of files.slice(0, Math.max(room, 0))) {
      try {
        const uploaded = await uploadOne(file);

        // Append to the existing gallery, never replace it
        setGallery((current) =>
          current.length >= MAX_GALLERY
            ? current
            : [
                ...current,
                {
                  url: uploaded.url,
                  storagePath: uploaded.storagePath,
                  alt: "",
                },
              ],
        );
      } catch (error) {
        setGalleryError(
          error instanceof Error ? error.message : "Failed to upload image.",
        );
      }
    }
  };

  const toggleService = (serviceId: string) => {
    setRelatedServices((current) =>
      current.includes(serviceId)
        ? current.filter((value) => value !== serviceId)
        : [...current, serviceId],
    );
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isUploading) {
      return;
    }

    setFormError(null);
    setHeroError(null);

    const cleanTitle = title.trim();
    const cleanSlug = slug.trim();
    const year = Number(yearInput);
    const order = Number(orderInput);

    if (!cleanTitle) {
      setFormError("Please enter the project title.");
      return;
    }

    if (!SLUG_PATTERN.test(cleanSlug)) {
      setFormError(
        "Slug can only contain lowercase letters, numbers and single hyphens.",
      );
      return;
    }

    if (!clientId) {
      setFormError("Please select a client.");
      return;
    }

    if (!industry.trim()) {
      setFormError("Please enter the industry.");
      return;
    }

    if (!Number.isInteger(year) || year < 1900 || year > 2100) {
      setFormError("Year must be between 1900 and 2100.");
      return;
    }

    if (orderInput.trim() === "" || !Number.isInteger(order) || order < 0) {
      setFormError("Order must be a whole number, 0 or greater.");
      return;
    }

    if (!heroImage.url) {
      setHeroError("Please upload a hero image.");
      return;
    }

    if (!shortDescription.trim()) {
      setFormError("Please enter the short description.");
      return;
    }

    if (isRichTextEmpty(overview)) {
      setFormError("Please add the project overview.");
      return;
    }

    if (isRichTextEmpty(challenge)) {
      setFormError("Please add the challenge.");
      return;
    }

    if (isRichTextEmpty(solution)) {
      setFormError("Please add the solution.");
      return;
    }

    if (gallery.some((image) => !image.url)) {
      setFormError(
        "A gallery image is missing its URL. Remove it and upload it again.",
      );
      return;
    }

    // Drop result rows the admin left completely empty
    const resultRows = results
      .map((item) => ({
        metric: item.metric.trim(),
        value: item.value.trim(),
        description: item.description?.trim() ?? "",
      }))
      .filter((item) => item.metric || item.value || item.description);

    for (const row of resultRows) {
      if (!row.metric || !row.value) {
        setFormError("Each result needs both a metric and a value.");
        return;
      }
    }

    const hadSeo = initialValues?.seo;

    onSubmit({
      title: cleanTitle,
      slug: cleanSlug,
      clientId,
      industry: industry.trim(),
      location: optionalText(location, Boolean(initialValues?.location)),
      shortDescription: shortDescription.trim(),
      overview,
      heroImage: {
        url: heroImage.url,
        alt: heroImage.alt.trim() || cleanTitle,
        ...(heroImage.storagePath
          ? { storagePath: heroImage.storagePath }
          : {}),
      },
      // The complete current gallery, not only new uploads
      gallery: gallery.map(({ url, alt, storagePath }) => ({
        url,
        alt: alt.trim() || cleanTitle,
        ...(storagePath ? { storagePath } : {}),
      })),
      challenge,
      solution,
      engineeringScope,
      technologies,
      results: resultRows.map((row) => ({
        metric: row.metric,
        value: row.value,
        ...(row.description ? { description: row.description } : {}),
      })),
      duration: optionalText(duration, Boolean(initialValues?.duration)),
      year,
      status,
      featured,
      order,
      relatedServices,
      seo: {
        metaTitle: optionalText(metaTitle, Boolean(hadSeo?.metaTitle)),
        metaDescription: optionalText(
          metaDescription,
          Boolean(hadSeo?.metaDescription),
        ),
        keywords,
      },
    });
  };

  return (
    <form id="project-form" onSubmit={handleSubmit} className="space-y-6">
      {formError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{formError}</p>
        </div>
      )}

      {/* BASIC INFORMATION */}
      <section className="rounded-lg border">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold">Basic Information</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The project name, client and where it appears.
          </p>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="project-title">Title</Label>
            <Input
              id="project-title"
              value={title}
              onChange={(event) => handleTitleChange(event.target.value)}
              placeholder="Project title"
              maxLength={200}
              required
              disabled={isFormDisabled}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="project-slug">Slug</Label>
            <Input
              id="project-slug"
              value={slug}
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(slugify(event.target.value));
              }}
              placeholder="project-title"
              maxLength={220}
              required
              disabled={isFormDisabled}
            />
            <p className="text-xs text-muted-foreground">
              Used in the project URL. Generated from the title.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="project-client">Client</Label>
            <select
              id="project-client"
              className={selectClass}
              value={clientId}
              onChange={(event) => setClientId(event.target.value)}
              required
              disabled={isFormDisabled}
            >
              <option value="">
                {clientsQuery.isLoading
                  ? "Loading clients..."
                  : "Select a client"}
              </option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="project-industry">Industry</Label>
            <Input
              id="project-industry"
              value={industry}
              onChange={(event) => setIndustry(event.target.value)}
              placeholder="e.g. Manufacturing"
              maxLength={150}
              required
              disabled={isFormDisabled}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="project-location">Location</Label>
            <Input
              id="project-location"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Optional"
              maxLength={200}
              disabled={isFormDisabled}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="project-duration">Duration</Label>
            <Input
              id="project-duration"
              value={duration}
              onChange={(event) => setDuration(event.target.value)}
              placeholder="Optional, e.g. 8 months"
              maxLength={100}
              disabled={isFormDisabled}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="project-year">Year</Label>
            <Input
              id="project-year"
              type="number"
              min={1900}
              max={2100}
              step={1}
              value={yearInput}
              onChange={(event) => setYearInput(event.target.value)}
              required
              disabled={isFormDisabled}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="project-order">Order</Label>
            <Input
              id="project-order"
              type="number"
              min={0}
              step={1}
              value={orderInput}
              onChange={(event) => setOrderInput(event.target.value)}
              required
              disabled={isFormDisabled}
            />
            <p className="text-xs text-muted-foreground">
              Lower numbers show first.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="project-status">Status</Label>
            <select
              id="project-status"
              className={selectClass}
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as ProjectStatus)
              }
              disabled={isFormDisabled}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="flex items-end pb-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                className="size-4"
                checked={featured}
                onChange={(event) => setFeatured(event.target.checked)}
                disabled={isFormDisabled}
              />
              Featured project
            </label>
          </div>
        </div>
      </section>

      {/* HERO IMAGE */}
      <section className="rounded-lg border">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold">Hero Image</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The main image for this project.
          </p>
        </div>

        <div className="grid gap-6 p-6">
          <div className="grid gap-2">
            <Label htmlFor="project-hero">Image</Label>
            <Input
              id="project-hero"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              disabled={isFormDisabled}
              onChange={(event) => {
                const file = event.target.files?.[0];

                if (!file) {
                  return;
                }

                void handleHeroUpload(file);

                event.target.value = "";
              }}
            />
            <p className="text-xs text-muted-foreground">
              JPG, PNG, WEBP or GIF. Maximum 5 MB.
            </p>
          </div>

          {heroError && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3">
              <p className="text-sm text-destructive">{heroError}</p>
            </div>
          )}

          {heroImage.url && (
            <div className="overflow-hidden rounded-lg border">
              <img
                src={heroImage.url}
                alt={heroImage.alt || "Hero image"}
                className="h-72 w-full object-cover"
              />
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="project-hero-alt">Alt Text</Label>
            <Input
              id="project-hero-alt"
              value={heroImage.alt}
              onChange={(event) =>
                setHeroImage((current) => ({
                  ...current,
                  alt: event.target.value,
                }))
              }
              placeholder="Describe the image"
              maxLength={200}
              disabled={isFormDisabled}
            />
            <p className="text-xs text-muted-foreground">
              Optional. If left empty, the project title is used.
            </p>
          </div>
        </div>
      </section>

      {/* DESCRIPTION */}
      <section className="rounded-lg border">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold">Short Description</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            A summary shown on project cards.
          </p>
        </div>

        <div className="grid gap-2 p-6">
          <Textarea
            id="project-short-description"
            value={shortDescription}
            onChange={(event) => setShortDescription(event.target.value)}
            placeholder="Write a short description..."
            rows={4}
            maxLength={500}
            required
            disabled={isFormDisabled}
          />
          <p className="text-right text-xs text-muted-foreground">
            {shortDescription.length} / 500
          </p>
        </div>
      </section>

      {/* CONTENT */}
      {[
        {
          title: "Overview",
          hint: "What the project was about.",
          value: overview,
          onChange: setOverview,
          placeholder: "Write the project overview...",
        },
        {
          title: "Challenge",
          hint: "The problem the client faced.",
          value: challenge,
          onChange: setChallenge,
          placeholder: "Describe the challenge...",
        },
        {
          title: "Solution",
          hint: "How the problem was solved.",
          value: solution,
          onChange: setSolution,
          placeholder: "Describe the solution...",
        },
      ].map((section) => (
        <section key={section.title} className="rounded-lg border">
          <div className="border-b p-6">
            <h2 className="text-lg font-semibold">{section.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{section.hint}</p>
          </div>

          <div className="p-6">
            <RichTextEditor
              value={section.value}
              onChange={section.onChange}
              placeholder={section.placeholder}
              minHeight={200}
              disabled={isFormDisabled}
            />
          </div>
        </section>
      ))}

      {/* SCOPE & TECHNOLOGIES */}
      <section className="rounded-lg border">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold">Scope & Technologies</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            What was delivered and what was used. Up to 30 each.
          </p>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="project-scope">Engineering Scope</Label>
            <TagInput
              id="project-scope"
              value={engineeringScope}
              onChange={setEngineeringScope}
              placeholder="e.g. Structural design"
              disabled={isFormDisabled}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="project-tech">Technologies</Label>
            <TagInput
              id="project-tech"
              value={technologies}
              onChange={setTechnologies}
              placeholder="e.g. AutoCAD"
              disabled={isFormDisabled}
            />
          </div>
        </div>
      </section>

      {/* RESULTS */}
      <section className="rounded-lg border">
        <div className="flex items-start justify-between gap-4 border-b p-6">
          <div>
            <h2 className="text-lg font-semibold">Results</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Measurable outcomes, such as "Cost saved: 18%".
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isFormDisabled}
            onClick={() =>
              setResults((current) => [
                ...current,
                { metric: "", value: "", description: "" },
              ])
            }
          >
            <Plus className="mr-2 size-4" />
            Add Result
          </Button>
        </div>

        <div className="space-y-4 p-6">
          {results.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No results yet. Click "Add Result" to add one.
            </p>
          )}

          {results.map((item, index) => (
            <div
              key={index}
              className="grid gap-3 rounded-md border p-4 md:grid-cols-[1fr_1fr_auto]"
            >
              <div className="grid gap-2">
                <Label htmlFor={`result-metric-${index}`}>Metric</Label>
                <Input
                  id={`result-metric-${index}`}
                  value={item.metric}
                  onChange={(event) =>
                    setResults((current) =>
                      current.map((row, i) =>
                        i === index
                          ? { ...row, metric: event.target.value }
                          : row,
                      ),
                    )
                  }
                  placeholder="Cost saved"
                  maxLength={150}
                  disabled={isFormDisabled}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor={`result-value-${index}`}>Value</Label>
                <Input
                  id={`result-value-${index}`}
                  value={item.value}
                  onChange={(event) =>
                    setResults((current) =>
                      current.map((row, i) =>
                        i === index
                          ? { ...row, value: event.target.value }
                          : row,
                      ),
                    )
                  }
                  placeholder="18%"
                  maxLength={150}
                  disabled={isFormDisabled}
                />
              </div>

              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Remove result"
                  disabled={isFormDisabled}
                  onClick={() =>
                    setResults((current) =>
                      current.filter((_, i) => i !== index),
                    )
                  }
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>

              <div className="grid gap-2 md:col-span-3">
                <Label htmlFor={`result-description-${index}`}>
                  Description
                </Label>
                <Input
                  id={`result-description-${index}`}
                  value={item.description ?? ""}
                  onChange={(event) =>
                    setResults((current) =>
                      current.map((row, i) =>
                        i === index
                          ? { ...row, description: event.target.value }
                          : row,
                      ),
                    )
                  }
                  placeholder="Optional"
                  maxLength={500}
                  disabled={isFormDisabled}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* GALLERY */}
      <section className="rounded-lg border">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold">Gallery</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Additional project images. Up to {MAX_GALLERY}.
          </p>
        </div>

        <div className="grid gap-6 p-6">
          <div className="grid gap-2">
            <Label htmlFor="project-gallery">Add images</Label>
            <Input
              id="project-gallery"
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/gif"
              disabled={isFormDisabled || gallery.length >= MAX_GALLERY}
              onChange={(event) => {
                const files = Array.from(event.target.files ?? []);

                if (files.length === 0) {
                  return;
                }

                void handleGalleryUpload(files);

                event.target.value = "";
              }}
            />
            <p className="text-xs text-muted-foreground">
              {gallery.length} / {MAX_GALLERY} images. Each up to 5 MB.
            </p>
          </div>

          {galleryError && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3">
              <p className="text-sm text-destructive">{galleryError}</p>
            </div>
          )}

          {isUploading && (
            <div className="rounded-md border p-4">
              <p className="text-sm text-muted-foreground">
                Uploading images...
              </p>
            </div>
          )}

          {gallery.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.map((image, index) => (
                <div
                  key={image.storagePath ?? `${image.url}-${index}`}
                  className="space-y-2 rounded-lg border p-3"
                >
                  <img
                    src={image.url}
                    alt={image.alt || "Gallery image"}
                    className="h-36 w-full rounded-md object-cover"
                  />

                  <Input
                    aria-label={`Alt text for gallery image ${index + 1}`}
                    value={image.alt}
                    onChange={(event) =>
                      setGallery((current) =>
                        current.map((item, i) =>
                          i === index
                            ? { ...item, alt: event.target.value }
                            : item,
                        ),
                      )
                    }
                    placeholder="Alt text (optional)"
                    maxLength={200}
                    disabled={isFormDisabled}
                  />

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    disabled={isFormDisabled}
                    onClick={() =>
                      // Remove only this image
                      setGallery((current) =>
                        current.filter((item) => item !== image),
                      )
                    }
                  >
                    <Trash2 className="mr-2 size-4 text-destructive" />
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* RELATED SERVICES */}
      <section className="rounded-lg border">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold">Related Services</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Services that were part of this project.
          </p>
        </div>

        <div className="p-6">
          {servicesQuery.isLoading && (
            <p className="text-sm text-muted-foreground">Loading services...</p>
          )}

          {!servicesQuery.isLoading && services.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No services available yet.
            </p>
          )}

          {services.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <label
                  key={service.id}
                  className="flex cursor-pointer items-center gap-2 rounded-md border p-3 text-sm"
                >
                  <input
                    type="checkbox"
                    className="size-4"
                    checked={relatedServices.includes(service.id)}
                    onChange={() => toggleService(service.id)}
                    disabled={isFormDisabled}
                  />
                  <span className="truncate">{service.title}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* SEO */}
      <section className="rounded-lg border">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold">SEO</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Optional search engine details.
          </p>
        </div>

        <div className="grid gap-6 p-6">
          <div className="grid gap-2">
            <Label htmlFor="project-meta-title">Meta Title</Label>
            <Input
              id="project-meta-title"
              value={metaTitle}
              onChange={(event) => setMetaTitle(event.target.value)}
              maxLength={60}
              disabled={isFormDisabled}
            />
            <p className="text-right text-xs text-muted-foreground">
              {metaTitle.length} / 60
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="project-meta-description">Meta Description</Label>
            <Textarea
              id="project-meta-description"
              value={metaDescription}
              onChange={(event) => setMetaDescription(event.target.value)}
              rows={3}
              maxLength={160}
              disabled={isFormDisabled}
            />
            <p className="text-right text-xs text-muted-foreground">
              {metaDescription.length} / 160
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="project-keywords">Keywords</Label>
            <TagInput
              id="project-keywords"
              value={keywords}
              onChange={setKeywords}
              placeholder="Add a keyword"
              max={20}
              disabled={isFormDisabled}
            />
          </div>
        </div>
      </section>
    </form>
  );
}
