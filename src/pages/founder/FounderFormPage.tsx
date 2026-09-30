import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";

import {
  useCreateFounder,
  useFounder,
  useFounders,
  useUpdateFounder,
} from "@/hooks/services/useFounder";
import { getErrorMessage } from "@/lib/getErrorMessage";

import type { CreateFounderInput } from "@/typings/founder.typings";

import { FounderForm } from "./FounderForm";

export function FounderFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const isEditMode = Boolean(id);

  const founderQuery = useFounder(id ?? "");
  const foundersQuery = useFounders();
  const createFounderMutation = useCreateFounder();
  const updateFounderMutation = useUpdateFounder();

  const [isUploading, setIsUploading] = useState(false);

  const isSubmitting =
    createFounderMutation.isPending || updateFounderMutation.isPending;

  const mutationError =
    createFounderMutation.error ?? updateFounderMutation.error;

  const goBack = () => navigate("/founder");

  // Next free order number for new founders
  const nextOrder = useMemo(() => {
    const orders = (foundersQuery.data?.data ?? []).map((f) => f.order);

    return orders.length > 0 ? Math.max(...orders) + 1 : 1;
  }, [foundersQuery.data]);

  const handleSubmit = (values: CreateFounderInput) => {
    if (isEditMode && id) {
      updateFounderMutation.mutate({ id, data: values }, { onSuccess: goBack });
      return;
    }

    createFounderMutation.mutate(values, { onSuccess: goBack });
  };

  if (isEditMode && founderQuery.isLoading) {
    return (
      <div>
        <PageHeader
          title="Edit Founder"
          description="Loading founder details..."
        />

        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (isEditMode && founderQuery.isError) {
    return (
      <div>
        <PageHeader title="Edit Founder" />

        <div className="space-y-6">
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6">
            <p className="text-sm text-destructive">
              {getErrorMessage(founderQuery.error, "Failed to load founder.")}
            </p>
          </div>

          <Button variant="outline" onClick={goBack}>
            Back to Founders
          </Button>
        </div>
      </div>
    );
  }

  const founder = founderQuery.data?.data;

  if (isEditMode && !founder) {
    return (
      <div>
        <PageHeader title="Edit Founder" />

        <div className="space-y-6">
          <div className="rounded-lg border p-6">
            <p className="text-sm text-muted-foreground">Founder not found.</p>
          </div>

          <Button variant="outline" onClick={goBack}>
            Back to Founders
          </Button>
        </div>
      </div>
    );
  }

  // In create mode, wait for the list so the default order is correct
  if (!isEditMode && foundersQuery.isLoading) {
    return (
      <div>
        <PageHeader title="Add Founder" description="Loading..." />
      </div>
    );
  }

  const initialValues: Partial<CreateFounderInput> = founder
    ? {
        name: founder.name,
        image: founder.image,
        overview: founder.overview,
        experience: founder.experience,
        order: founder.order,
      }
    : { order: nextOrder };

  return (
    <div>
      <PageHeader
        title={isEditMode ? "Edit Founder" : "Add Founder"}
        description={
          isEditMode
            ? "Update the founder details."
            : "Add a new founder to your website."
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
              form="founder-form"
              disabled={isSubmitting || isUploading}
            >
              {isSubmitting
                ? "Saving..."
                : isEditMode
                  ? "Save Changes"
                  : "Add Founder"}
            </Button>
          </>
        }
      />

      <div className="space-y-6">
        {mutationError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">
              {getErrorMessage(mutationError, "Failed to save founder.")}
            </p>
          </div>
        )}

        <FounderForm
          key={id ?? "new"}
          initialValues={initialValues}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          onUploadingChange={setIsUploading}
        />
      </div>
    </div>
  );
}
