import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";

import {
  useCreateDocument,
  useDocument,
  useUpdateDocument,
} from "@/hooks/services/useDocuments";
import { getErrorMessage } from "@/lib/getErrorMessage";

import type { DocumentFormValues } from "@/typings/documents.typings";

import { DocumentForm } from "./Documentform";

export function DocumentFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const isEditMode = Boolean(id);

  const documentQuery = useDocument(id ?? "");
  const createMutation = useCreateDocument();
  const updateMutation = useUpdateDocument();

  const [isUploading, setIsUploading] = useState(false);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const mutationError = createMutation.error ?? updateMutation.error;

  const goBack = () => navigate("/documents");

  const handleSubmit = (values: DocumentFormValues) => {
    if (isEditMode && id) {
      // Update accepts clientId: null to clear the client
      updateMutation.mutate({ id, data: values }, { onSuccess: goBack });
      return;
    }

    // Create does not accept null
    createMutation.mutate(
      { ...values, clientId: values.clientId ?? undefined },
      { onSuccess: goBack },
    );
  };

  if (isEditMode && documentQuery.isLoading) {
    return (
      <div>
        <PageHeader title="Edit Document" description="Loading document..." />

        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (isEditMode && documentQuery.isError) {
    return (
      <div>
        <PageHeader title="Edit Document" />

        <div className="space-y-6">
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6">
            <p className="text-sm text-destructive">
              {getErrorMessage(documentQuery.error, "Failed to load document.")}
            </p>
          </div>

          <Button variant="outline" onClick={goBack}>
            Back to Documents
          </Button>
        </div>
      </div>
    );
  }

  const document = documentQuery.data?.data;

  if (isEditMode && !document) {
    return (
      <div>
        <PageHeader title="Edit Document" />

        <div className="space-y-6">
          <div className="rounded-lg border p-6">
            <p className="text-sm text-muted-foreground">Document not found.</p>
          </div>

          <Button variant="outline" onClick={goBack}>
            Back to Documents
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={isEditMode ? "Edit Document" : "Create Document"}
        description={
          isEditMode
            ? "Update the document details."
            : "Add a new document to your library."
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
              form="document-form"
              disabled={isSubmitting || isUploading}
            >
              {isSubmitting
                ? "Saving..."
                : isEditMode
                  ? "Save Changes"
                  : "Create Document"}
            </Button>
          </>
        }
      />

      <div className="space-y-6">
        {mutationError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">
              {getErrorMessage(mutationError, "Failed to save document.")}
            </p>
          </div>
        )}

        <DocumentForm
          key={id ?? "new"}
          initialValues={document}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          onUploadingChange={setIsUploading}
        />
      </div>
    </div>
  );
}
