import { useState, type FormEvent } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { RichTextEditor } from "@/components/rich-text-editor";

import type {
  CreateLandingPageInput,
  LandingPage,
} from "@/typings/landing-page.typings";

interface LandingPageFormProps {
  initialValues?: Partial<LandingPage>;
  isSubmitting: boolean;
  onSubmit: (values: CreateLandingPageInput) => void;
}

const DESCRIPTION_LIMIT = 500;

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

export function LandingPageForm({
  initialValues,
  isSubmitting,
  onSubmit,
}: LandingPageFormProps) {
  const [title, setTitle] = useState(initialValues?.hero?.title ?? "");
  const [description, setDescription] = useState(
    initialValues?.hero?.description ?? "",
  );
  const [whatWeDo, setWhatWeDo] = useState(initialValues?.whatWeDo ?? "");

  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const heroTitle = title.trim();
    const heroDescription = description.trim();

    if (!heroTitle) {
      setFormError("Please enter the hero title.");
      return;
    }

    if (heroDescription.length > DESCRIPTION_LIMIT) {
      setFormError(
        `Hero description must be ${DESCRIPTION_LIMIT} characters or fewer.`,
      );
      return;
    }

    if (isRichTextEmpty(whatWeDo)) {
      setFormError("Please add the What We Do content.");
      return;
    }

    onSubmit({
      hero: {
        title: heroTitle,
        // Empty string clears a description that was set before
        description:
          heroDescription ||
          (initialValues?.hero?.description ? "" : undefined),
      },
      whatWeDo,
    });
  };

  return (
    <form id="landing-page-form" onSubmit={handleSubmit} className="space-y-6">
      {formError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{formError}</p>
        </div>
      )}

      {/* HERO */}
      <section className="rounded-lg border">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold">Hero</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            The headline section at the top of your website.
          </p>
        </div>

        <div className="grid gap-6 p-6">
          <div className="grid gap-2">
            <Label htmlFor="landing-hero-title">Title</Label>

            <Input
              id="landing-hero-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Main headline"
              maxLength={200}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="landing-hero-description">Description</Label>

            <Textarea
              id="landing-hero-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Optional short description under the headline..."
              rows={4}
              maxLength={DESCRIPTION_LIMIT}
              disabled={isSubmitting}
            />

            <p className="text-right text-xs text-muted-foreground">
              {description.length} / {DESCRIPTION_LIMIT}
            </p>
          </div>
        </div>
      </section>

      {/* WHAT WE DO */}
      <section className="rounded-lg border">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold">What We Do</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Describe what the company does and its capabilities.
          </p>
        </div>

        <div className="p-6">
          <RichTextEditor
            value={whatWeDo}
            onChange={setWhatWeDo}
            placeholder="Write what your company does..."
            disabled={isSubmitting}
          />
        </div>
      </section>
    </form>
  );
}
