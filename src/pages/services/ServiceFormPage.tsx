import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";

import {
  useCreateService,
  useService,
  useUpdateService,
} from "@/hooks/services/useServices";

import type {
  CreateServiceInput,
  UpdateServiceInput,
} from "@/typings/services.typings";

import { ServiceForm } from "./ServiceForm";

export function ServiceFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const isEditMode = Boolean(id);

  const serviceQuery = useService(id ?? "");

  const createServiceMutation = useCreateService();
  const updateServiceMutation = useUpdateService();

  const isSubmitting =
    createServiceMutation.isPending || updateServiceMutation.isPending;

  const handleCreate = async (values: CreateServiceInput) => {
    try {
      await createServiceMutation.mutateAsync(values);
      navigate("/services");
    } catch {
      // Error is available through createServiceMutation.error.
    }
  };

  const handleUpdate = async (values: CreateServiceInput) => {
    if (!id) {
      return;
    }

    try {
      const updateValues: UpdateServiceInput = values;

      await updateServiceMutation.mutateAsync({
        id,
        data: updateValues,
      });

      navigate("/services");
    } catch {
      // Error is available through updateServiceMutation.error.
    }
  };

  const handleSubmit = async (values: CreateServiceInput) => {
    if (isEditMode) {
      await handleUpdate(values);
      return;
    }

    await handleCreate(values);
  };

  // --------------------------------------------------
  // Edit mode: loading
  // --------------------------------------------------

  if (isEditMode && serviceQuery.isLoading) {
    return (
      <div>
        <PageHeader
          title="Edit Service"
          description="Loading service details..."
        />

        <div className="flex h-48 items-center justify-center rounded-lg border">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Edit mode: error
  // --------------------------------------------------

  if (isEditMode && serviceQuery.isError) {
    return (
      <div>
        <PageHeader title="Edit Service" />

        <div className="space-y-6">
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6">
            <p className="text-sm text-destructive">
              {serviceQuery.error instanceof Error
                ? serviceQuery.error.message
                : "Failed to load service."}
            </p>
          </div>

          <Button variant="outline" onClick={() => navigate("/services")}>
            Back to Services
          </Button>
        </div>
      </div>
    );
  }

  const service = serviceQuery.data?.data;

  // --------------------------------------------------
  // Edit mode: service not found
  // --------------------------------------------------

  if (isEditMode && !service) {
    return (
      <div>
        <PageHeader title="Edit Service" />

        <div className="space-y-6">
          <div className="rounded-lg border p-6">
            <p className="text-sm text-muted-foreground">Service not found.</p>
          </div>

          <Button variant="outline" onClick={() => navigate("/services")}>
            Back to Services
          </Button>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Initial values
  // --------------------------------------------------

  const initialValues: Partial<CreateServiceInput> | undefined = service
    ? {
        title: service.title,
        slug: service.slug,
        tagline: service.tagline,
        shortDescription: service.shortDescription,
        heroImage: service.heroImage,
        summary: service.summary,
        overview: service.overview,
        detail: service.detail,
        capabilities: service.capabilities,
        technologies: service.technologies,
        industries: service.industries,
        deliverables: service.deliverables,
        process: service.process,
        benefits: service.benefits,
        faqs: service.faqs,
        status: service.status,
        featured: service.featured,
        order: service.order,
        seo: service.seo,
      }
    : undefined;

  const mutationError =
    createServiceMutation.error ?? updateServiceMutation.error;

  return (
    <div>
      <PageHeader
        title={isEditMode ? "Edit Service" : "Create Service"}
        description={
          isEditMode
            ? "Update the service details."
            : "Create a new service for your website."
        }
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/services")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button type="submit" form="service-form" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : isEditMode
                  ? "Save Changes"
                  : "Create Service"}
            </Button>
          </>
        }
      />

      <div className="space-y-6">
        {/* Mutation Error */}
        {mutationError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">
              {mutationError instanceof Error
                ? mutationError.message
                : "Failed to save service."}
            </p>
          </div>
        )}

        {/* Form */}
        <ServiceForm
          initialValues={initialValues}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit} 
        />
      </div>
    </div>
  );
}
