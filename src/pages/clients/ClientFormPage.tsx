import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";

import {
  useClient,
  useCreateClient,
  useUpdateClient,
} from "@/hooks/services/useClients";

import type { CreateClientInput } from "@/typings/clients.typings";

import { ClientForm } from "./ClientForm";

export function ClientFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const isEditMode = Boolean(id);

  const clientQuery = useClient(id ?? "");
  const createClientMutation = useCreateClient();
  const updateClientMutation = useUpdateClient();

  const [isUploading, setIsUploading] = useState(false);

  const isSubmitting =
    createClientMutation.isPending || updateClientMutation.isPending;

  const mutationError =
    createClientMutation.error ?? updateClientMutation.error;

  const goBack = () => navigate("/clients");

  const handleSubmit = (values: CreateClientInput) => {
    if (isEditMode && id) {
      updateClientMutation.mutate({ id, data: values }, { onSuccess: goBack });
      return;
    }

    createClientMutation.mutate(values, { onSuccess: goBack });
  };

  // Loading
  if (isEditMode && clientQuery.isLoading) {
    return (
      <div>
        <PageHeader
          title="Edit Client"
          description="Loading client details..."
        />

        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Error
  if (isEditMode && clientQuery.isError) {
    return (
      <div>
        <PageHeader title="Edit Client" />

        <div className="space-y-6">
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6">
            <p className="text-sm text-destructive">
              {clientQuery.error instanceof Error
                ? clientQuery.error.message
                : "Failed to load client."}
            </p>
          </div>

          <Button variant="outline" onClick={goBack}>
            Back to Clients
          </Button>
        </div>
      </div>
    );
  }

  const client = clientQuery.data?.data;

  // Not found
  if (isEditMode && !client) {
    return (
      <div>
        <PageHeader title="Edit Client" />

        <div className="space-y-6">
          <div className="rounded-lg border p-6">
            <p className="text-sm text-muted-foreground">Client not found.</p>
          </div>

          <Button variant="outline" onClick={goBack}>
            Back to Clients
          </Button>
        </div>
      </div>
    );
  }

  const initialValues: Partial<CreateClientInput> | undefined = client
    ? {
        name: client.name,
        image: client.image,
        industry: client.industry,
      }
    : undefined;

  return (
    <div>
      <PageHeader
        title={isEditMode ? "Edit Client" : "Create Client"}
        description={
          isEditMode
            ? "Update the client details."
            : "Add a new client to your website."
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
              form="client-form"
              disabled={isSubmitting || isUploading}
            >
              {isSubmitting
                ? "Saving..."
                : isEditMode
                  ? "Save Changes"
                  : "Create Client"}
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
                : "Failed to save client."}
            </p>
          </div>
        )}

        <ClientForm
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
