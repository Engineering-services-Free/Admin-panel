import { useEffect, useState, type FormEvent } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { RichTextEditor } from "@/components/rich-text-editor";
import { TagInput } from "@/components/common/TagInput";

import { uploadImage } from "@/api/uploads.api";
import { useProjects } from "@/hooks/services/useProjects";

import type {
  Blog,
  BlogImage,
  BlogStatus,
  CreateBlogInput,
} from "@/typings/blogs.typings";

interface BlogFormProps {
  initialValues?: Partial<Blog>;
  isSubmitting: boolean;
  onSubmit: (values: CreateBlogInput) => void;
  onUploadingChange?: (isUploading: boolean) => void;
}

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

function htmlToPlain(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isRichTextEmpty(html: string) {
  if (/<img\s/i.test(html)) {
    return false;
  }

  return htmlToPlain(html) === "";
}

// About 200 words per minute, limited to the allowed 1-120 range
function estimateReadingTime(html: string) {
  const text = htmlToPlain(html);
  const words = text ? text.split(" ").length : 0;

  return Math.min(120, Math.max(1, Math.ceil(words / 200)));
}

// Optional text: "" clears a value that existed before, undefined otherwise
function optionalText(value: string, hadValue: boolean) {
  const trimmed = value.trim();

  return trimmed || (hadValue ? "" : undefined);
}

// ISO string -> value for <input type="datetime-local">
function toLocalInput(iso?: string) {
  if (!iso) {
    return "";
  }

  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset() * 60000;

  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function BlogForm({
  initialValues,
  isSubmitting,
  onSubmit,
  onUploadingChange,
}: BlogFormProps) {
  const isEdit = Boolean(initialValues?.id);

  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [slug, setSlug] = useState(initialValues?.slug ?? "");
  // Follow the title unless the admin customized the slug earlier
  const [slugTouched, setSlugTouched] = useState(
    isEdit && initialValues?.slug !== slugify(initialValues?.title ?? ""),
  );
  const [projectId, setProjectId] = useState(initialValues?.projectId ?? "");

  const [shortDescription, setShortDescription] = useState(
    initialValues?.shortDescription ?? "",
  );
  const [overview, setOverview] = useState(initialValues?.overview ?? "");
  const [content, setContent] = useState(initialValues?.content ?? "");

  const [coverImage, setCoverImage] = useState<BlogImage>(
    initialValues?.coverImage ?? { url: "", alt: "" },
  );

  const [technologies, setTechnologies] = useState<string[]>(
    initialValues?.technologies ?? [],
  );
  const [keyTakeaways, setKeyTakeaways] = useState<string[]>(
    initialValues?.keyTakeaways ?? [],
  );

  const [readingTimeInput, setReadingTimeInput] = useState(
    String(initialValues?.readingTime ?? 1),
  );
  // In edit mode the saved value is kept until the admin clicks "Estimate"
  const [readingTouched, setReadingTouched] = useState(isEdit);

  const [orderInput, setOrderInput] = useState(
    String(initialValues?.order ?? 0),
  );
  const [status, setStatus] = useState<BlogStatus>(
    initialValues?.status ?? "draft",
  );
  const [featured, setFeatured] = useState(initialValues?.featured ?? false);
  const [publishedAt, setPublishedAt] = useState(
    toLocalInput(initialValues?.publishedAt),
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

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const isFormDisabled = isSubmitting || isUploadingImage;

  const projectsQuery = useProjects({ page: 1, limit: 100 });
  const projects = projectsQuery.data?.data ?? [];

  useEffect(() => {
    onUploadingChange?.(isUploadingImage);
  }, [isUploadingImage, onUploadingChange]);

  const handleTitleChange = (value: string) => {
    setTitle(value);

    if (!slugTouched) {
      setSlug(slugify(value));
    }
  };

  const handleContentChange = (value: string) => {
    setContent(value);

    if (!readingTouched) {
      setReadingTimeInput(String(estimateReadingTime(value)));
    }
  };

  const handleCoverUpload = async (file: File) => {
    try {
      setCoverError(null);
      setIsUploadingImage(true);

      const uploaded = await uploadImage(file, "blogs");

      setCoverImage((current) => ({
        url: uploaded.url,
        storagePath: uploaded.storagePath,
        alt: current.alt,
      }));
    } catch (error) {
      setCoverError(
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
    setCoverError(null);

    const cleanTitle = title.trim();
    const cleanSlug = slug.trim();
    const readingTime = Number(readingTimeInput);
    const order = Number(orderInput);

    if (!cleanTitle) {
      setFormError("Please enter the blog title.");
      return;
    }

    if (!SLUG_PATTERN.test(cleanSlug)) {
      setFormError(
        "Slug can only contain lowercase letters, numbers and single hyphens.",
      );
      return;
    }

    if (!projectId) {
      setFormError("Please select the project this blog belongs to.");
      return;
    }

    if (!coverImage.url) {
      setCoverError("Please upload a cover image.");
      return;
    }

    if (!shortDescription.trim()) {
      setFormError("Please enter the short description.");
      return;
    }

    if (!overview.trim()) {
      setFormError("Please enter the overview.");
      return;
    }

    if (isRichTextEmpty(content)) {
      setFormError("Please write the blog content.");
      return;
    }

    if (
      !Number.isInteger(readingTime) ||
      readingTime < 1 ||
      readingTime > 120
    ) {
      setFormError("Reading time must be a whole number from 1 to 120.");
      return;
    }

    if (orderInput.trim() === "" || !Number.isInteger(order) || order < 0) {
      setFormError("Order must be a whole number, 0 or greater.");
      return;
    }

    // Published blogs need a date. Empty means "now".
    let publishedIso: string | undefined;

    if (publishedAt) {
      publishedIso = new Date(publishedAt).toISOString();
    } else if (status === "published") {
      publishedIso = new Date().toISOString();
    }

    const hadSeo = initialValues?.seo;

    onSubmit({
      title: cleanTitle,
      slug: cleanSlug,
      shortDescription: shortDescription.trim(),
      overview: overview.trim(),
      coverImage: {
        url: coverImage.url,
        alt: coverImage.alt.trim() || cleanTitle,
        ...(coverImage.storagePath
          ? { storagePath: coverImage.storagePath }
          : {}),
      },
      content,
      projectId,
      technologies,
      keyTakeaways,
      readingTime,
      status,
      featured,
      order,
      ...(publishedIso ? { publishedAt: publishedIso } : {}),
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
    <form id="blog-form" onSubmit={handleSubmit} className="space-y-6">
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
            The blog title, URL and the project it belongs to.
          </p>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="blog-title">Title</Label>
            <Input
              id="blog-title"
              value={title}
              onChange={(event) => handleTitleChange(event.target.value)}
              placeholder="Blog title"
              maxLength={200}
              required
              disabled={isFormDisabled}
            />
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="blog-slug">Slug</Label>

              <button
                type="button"
                className="text-xs text-primary underline underline-offset-2 disabled:opacity-50"
                disabled={isFormDisabled}
                onClick={() => {
                  setSlug(slugify(title));
                  setSlugTouched(false);
                }}
              >
                Regenerate from title
              </button>
            </div>

            <Input
              id="blog-slug"
              value={slug}
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(slugify(event.target.value));
              }}
              placeholder="blog-title"
              maxLength={220}
              required
              disabled={isFormDisabled}
            />
            <p className="text-xs text-muted-foreground">
              Used in the blog URL. Changing it changes the public link.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="blog-project">Project</Label>
            <select
              id="blog-project"
              className={selectClass}
              value={projectId}
              onChange={(event) => setProjectId(event.target.value)}
              required
              disabled={isFormDisabled}
            >
              <option value="">
                {projectsQuery.isLoading
                  ? "Loading projects..."
                  : "Select a project"}
              </option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="blog-status">Status</Label>
            <select
              id="blog-status"
              className={selectClass}
              value={status}
              onChange={(event) => setStatus(event.target.value as BlogStatus)}
              disabled={isFormDisabled}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="blog-published-at">Published At</Label>
            <Input
              id="blog-published-at"
              type="datetime-local"
              value={publishedAt}
              onChange={(event) => setPublishedAt(event.target.value)}
              disabled={isFormDisabled}
            />
            <p className="text-xs text-muted-foreground">
              Optional. Left empty, a published blog uses the save time.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="blog-order">Order</Label>
            <Input
              id="blog-order"
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
            <div className="flex items-center justify-between">
              <Label htmlFor="blog-reading-time">Reading Time (minutes)</Label>

              <button
                type="button"
                className="text-xs text-primary underline underline-offset-2 disabled:opacity-50"
                disabled={isFormDisabled}
                onClick={() => {
                  setReadingTimeInput(String(estimateReadingTime(content)));
                  setReadingTouched(false);
                }}
              >
                Estimate from content
              </button>
            </div>

            <Input
              id="blog-reading-time"
              type="number"
              min={1}
              max={120}
              step={1}
              value={readingTimeInput}
              onChange={(event) => {
                setReadingTouched(true);
                setReadingTimeInput(event.target.value);
              }}
              required
              disabled={isFormDisabled}
            />
          </div>

          <div className="flex items-end pb-2 md:col-span-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                className="size-4"
                checked={featured}
                onChange={(event) => setFeatured(event.target.checked)}
                disabled={isFormDisabled}
              />
              Featured blog
            </label>
          </div>
        </div>
      </section>

      {/* COVER IMAGE */}
      <section className="rounded-lg border">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold">Cover Image</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The main image for this blog.
          </p>
        </div>

        <div className="grid gap-6 p-6">
          <div className="grid gap-2">
            <Label htmlFor="blog-cover">Image</Label>
            <Input
              id="blog-cover"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              disabled={isFormDisabled}
              onChange={(event) => {
                const file = event.target.files?.[0];

                if (!file) {
                  return;
                }

                void handleCoverUpload(file);

                event.target.value = "";
              }}
            />
            <p className="text-xs text-muted-foreground">
              JPG, PNG, WEBP or GIF. Maximum 5 MB.
            </p>
          </div>

          {coverError && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3">
              <p className="text-sm text-destructive">{coverError}</p>
            </div>
          )}

          {isUploadingImage && (
            <div className="rounded-md border p-4">
              <p className="text-sm text-muted-foreground">
                Uploading image...
              </p>
            </div>
          )}

          {coverImage.url && (
            <div className="overflow-hidden rounded-lg border">
              <img
                src={coverImage.url}
                alt={coverImage.alt || "Cover image"}
                className="h-72 w-full object-cover"
              />
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="blog-cover-alt">Alt Text</Label>
            <Input
              id="blog-cover-alt"
              value={coverImage.alt}
              onChange={(event) =>
                setCoverImage((current) => ({
                  ...current,
                  alt: event.target.value,
                }))
              }
              placeholder="Describe the image"
              maxLength={200}
              disabled={isFormDisabled}
            />
            <p className="text-xs text-muted-foreground">
              Optional. If left empty, the blog title is used.
            </p>
          </div>
        </div>
      </section>

      {/* SHORT DESCRIPTION */}
      <section className="rounded-lg border">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold">Short Description</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            A summary shown on blog cards.
          </p>
        </div>

        <div className="grid gap-2 p-6">
          <Textarea
            id="blog-short-description"
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

      {/* OVERVIEW */}
      <section className="rounded-lg border">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold">Overview</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            An introduction shown before the article.
          </p>
        </div>

        <div className="grid gap-2 p-6">
          <Textarea
            id="blog-overview"
            value={overview}
            onChange={(event) => setOverview(event.target.value)}
            placeholder="Write the overview..."
            rows={7}
            maxLength={5000}
            required
            disabled={isFormDisabled}
          />
          <p className="text-right text-xs text-muted-foreground">
            {overview.length} / 5000
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="rounded-lg border">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold">Content</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The full article.
          </p>
        </div>

        <div className="p-6">
          <RichTextEditor
            value={content}
            onChange={handleContentChange}
            placeholder="Write the article..."
            minHeight={360}
            disabled={isFormDisabled}
          />
        </div>
      </section>

      {/* TECHNOLOGIES & TAKEAWAYS */}
      <section className="rounded-lg border">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold">
            Technologies & Key Takeaways
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Up to 30 technologies and 10 key takeaways.
          </p>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="blog-tech">Technologies</Label>
            <TagInput
              id="blog-tech"
              value={technologies}
              onChange={setTechnologies}
              placeholder="e.g. React"
              max={30}
              disabled={isFormDisabled}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="blog-takeaways">Key Takeaways</Label>
            <TagInput
              id="blog-takeaways"
              value={keyTakeaways}
              onChange={setKeyTakeaways}
              placeholder="Add a key point"
              max={10}
              disabled={isFormDisabled}
            />
          </div>
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
            <Label htmlFor="blog-meta-title">Meta Title</Label>
            <Input
              id="blog-meta-title"
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
            <Label htmlFor="blog-meta-description">Meta Description</Label>
            <Textarea
              id="blog-meta-description"
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
            <Label htmlFor="blog-keywords">Keywords</Label>
            <TagInput
              id="blog-keywords"
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
