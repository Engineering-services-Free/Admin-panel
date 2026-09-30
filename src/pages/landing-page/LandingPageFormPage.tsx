import { useNavigate } from "react-router-dom";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";

import {
  useCreateLandingPage,
  useLandingPage,
  useUpdateLandingPage,
} from "@/hooks/services/useLandingPage";
import { getErrorMessage } from "@/lib/getErrorMessage";

import type { CreateLandingPageInput } from "@/typings/landing-page.typings";

import { LandingPageForm } from "./LandingPageForm";

export function LandingPageFormPage() {
  const navigate = useNavigate();

  const landingQuery = useLandingPage();
  const createMutation = useCreateLandingPage();
  const updateMutation = useUpdateLandingPage();

  const isNotFound =
    landingQuery.isError &&
    axios.isAxiosError(landingQuery.error) &&
    landingQuery.error.response?.status === 404;

  const landing = landingQuery.data?.data ?? undefined;
  const isEditMode = Boolean(landing);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const mutationError = createMutation.error ?? updateMutation.error;

  const goBack = () => navigate("/landing-page");

  const handleSubmit = (values: CreateLandingPageInput) => {
    if (isEditMode) {
      updateMutation.mutate(values, { onSuccess: goBack });
      return;
    }

    createMutation.mutate(values, { onSuccess: goBack });
  };

  if (landingQuery.isLoading) {
    return (
      <div>
        <PageHeader
          title="Landing Page"
          description="Loading landing page content..."
        />

        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (landingQuery.isError && !isNotFound) {
    return (
      <div>
        <PageHeader title="Landing Page" />

        <div className="space-y-6">
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6">
            <p className="text-sm text-destructive">
              {getErrorMessage(
                landingQuery.error,
                "Failed to load landing page content.",
              )}
            </p>
          </div>

          <Button variant="outline" onClick={goBack}>
            Back to Landing Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={isEditMode ? "Edit Landing Page" : "Create Landing Page"}
        description={
          isEditMode
            ? "Update your landing page content."
            : "Add the landing page content for your website."
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
              form="landing-page-form"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Saving..."
                : isEditMode
                  ? "Save Changes"
                  : "Create Landing Page"}
            </Button>
          </>
        }
      />

      <div className="space-y-6">
        {mutationError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">
              {getErrorMessage(
                mutationError,
                "Failed to save landing page content.",
              )}
            </p>
          </div>
        )}

        <LandingPageForm
          initialValues={landing}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
