import { useNavigate } from "react-router-dom";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";

import {
  useContact,
  useCreateContact,
  useUpdateContact,
} from "@/hooks/services/useContact";
import { getErrorMessage } from "@/lib/getErrorMessage";

import type { CreateContactInput } from "@/typings/contact.typings";

import { ContactForm } from "./ContactForm";

export function ContactFormPage() {
  const navigate = useNavigate();

  const contactQuery = useContact();
  const createContactMutation = useCreateContact();
  const updateContactMutation = useUpdateContact();

  const isNotFound =
    contactQuery.isError &&
    axios.isAxiosError(contactQuery.error) &&
    contactQuery.error.response?.status === 404;

  const contact = contactQuery.data?.data ?? undefined;
  const isEditMode = Boolean(contact);

  const isSubmitting =
    createContactMutation.isPending || updateContactMutation.isPending;

  const mutationError =
    createContactMutation.error ?? updateContactMutation.error;

  const goBack = () => navigate("/contact");

  const handleSubmit = (values: CreateContactInput) => {
    if (isEditMode) {
      updateContactMutation.mutate(values, { onSuccess: goBack });
      return;
    }

    createContactMutation.mutate(values, { onSuccess: goBack });
  };

  if (contactQuery.isLoading) {
    return (
      <div>
        <PageHeader title="Contact" description="Loading contact details..." />

        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (contactQuery.isError && !isNotFound) {
    return (
      <div>
        <PageHeader title="Contact" />

        <div className="space-y-6">
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6">
            <p className="text-sm text-destructive">
              {getErrorMessage(
                contactQuery.error,
                "Failed to load contact details.",
              )}
            </p>
          </div>

          <Button variant="outline" onClick={goBack}>
            Back to Contact
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={isEditMode ? "Edit Contact" : "Create Contact"}
        description={
          isEditMode
            ? "Update your website contact details."
            : "Add the contact details for your website."
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

            <Button type="submit" form="contact-form" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : isEditMode
                  ? "Save Changes"
                  : "Create Contact"}
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
                "Failed to save contact details.",
              )}
            </p>
          </div>
        )}

        <ContactForm
          initialValues={contact}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
