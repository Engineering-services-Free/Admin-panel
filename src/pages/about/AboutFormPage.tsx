import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";

import {
  useAbout,
  useCreateAbout,
  useUpdateAbout,
} from "@/hooks/services/useAbout";

import { AboutForm } from "./AboutForm";

import type { CreateAboutInput } from "@/typings/about.typings";

export function AboutFormPage() {
  const navigate = useNavigate();

  const aboutQuery = useAbout();
  const createAboutMutation = useCreateAbout();
  const updateAboutMutation = useUpdateAbout();

  const [isUploading, setIsUploading] = useState(false);

  const isNotFound =
    aboutQuery.isError &&
    axios.isAxiosError(aboutQuery.error) &&
    aboutQuery.error.response?.status === 404;

  const initialValues = aboutQuery.data?.data ?? undefined;
  const isEditMode = Boolean(initialValues);

  const isSubmitting =
    createAboutMutation.isPending || updateAboutMutation.isPending;

  const mutationError = createAboutMutation.error ?? updateAboutMutation.error;

  const goBack = () => navigate("/about");

  const handleSubmit = (values: CreateAboutInput) => {
    if (isEditMode) {
      updateAboutMutation.mutate(values, { onSuccess: goBack });
      return;
    }

    createAboutMutation.mutate(values, { onSuccess: goBack });
  };

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (aboutQuery.isLoading) {
    return (
      <div>
        <PageHeader title="About" description="Loading About information..." />

        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Error (not a 404)
  // --------------------------------------------------

  if (aboutQuery.isError && !isNotFound) {
    return (
      <div>
        <PageHeader title="About" />

        <div className="space-y-6">
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6">
            <p className="text-sm text-destructive">
              {aboutQuery.error instanceof Error
                ? aboutQuery.error.message
                : "Failed to load About information."}
            </p>
          </div>

          <Button variant="outline" onClick={goBack}>
            Back to About
          </Button>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Form
  // --------------------------------------------------

  return (
    <div>
      <PageHeader
        title={isEditMode ? "Edit About" : "Create About"}
        description={
          isEditMode
            ? "Update your company About information."
            : "Create the About information for your website."
        }
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={goBack}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              form="about-form"
              disabled={isSubmitting || isUploading}
            >
              {isSubmitting
                ? "Saving..."
                : isEditMode
                  ? "Save Changes"
                  : "Create About"}
            </Button>
          </>
        }
      />

      <div className="space-y-6">
        {mutationError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">
              {mutationError instanceof Error
                ? mutationError.message
                : "Failed to save About information."}
            </p>
          </div>
        )}

        <AboutForm
          initialValues={initialValues}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          onCancel={goBack}
          onUploadingChange={setIsUploading}
        />
      </div>
    </div>
  );
}
