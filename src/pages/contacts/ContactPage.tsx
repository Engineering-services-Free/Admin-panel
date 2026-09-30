import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ExternalLink, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";
import { DeleteConfirmDialog } from "@/components/common/DeleteConfirmDialog";

import { useContact, useDeleteContact } from "@/hooks/services/useContact";
import { getErrorMessage } from "@/lib/getErrorMessage";

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1 px-6 py-4 sm:grid-cols-[200px_1fr] sm:gap-6">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words text-sm">{children}</dd>
    </div>
  );
}

const linkClass = "text-primary underline underline-offset-2";

// Numbers are stored as 10 digits. Older records may still contain
// "+91...", so keep the last 10 digits when there are more.
function toLocalDigits(value: string) {
  const digits = value.replace(/\D/g, "");

  return digits.length > 10 ? digits.slice(-10) : digits;
}

function PhoneLink({ value }: { value: string }) {
  const digits = toLocalDigits(value);

  return (
    <a className={linkClass} href={`tel:+91${digits}`}>
      +91 {digits}
    </a>
  );
}

export function ContactPage() {
  const navigate = useNavigate();

  const contactQuery = useContact();
  const deleteContactMutation = useDeleteContact();

  const [confirmDelete, setConfirmDelete] = useState(false);

  const contact = contactQuery.data?.data;

  const isNotFound =
    contactQuery.isError &&
    axios.isAxiosError(contactQuery.error) &&
    contactQuery.error.response?.status === 404;

  const handleDelete = async () => {
    try {
      await deleteContactMutation.mutateAsync();
      setConfirmDelete(false);
    } catch {
      // Error is available through deleteContactMutation.error
    }
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
        <PageHeader
          title="Contact"
          description="Manage your contact details."
        />

        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6">
          <p className="text-sm text-destructive">
            {getErrorMessage(
              contactQuery.error,
              "Failed to load contact details.",
            )}
          </p>
        </div>
      </div>
    );
  }

  if (isNotFound || !contact) {
    return (
      <div>
        <PageHeader
          title="Contact"
          description="Manage your contact details."
        />

        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed px-6 py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <Phone className="size-6 text-muted-foreground" />
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-semibold">No contact details yet</h2>
            <p className="text-sm text-muted-foreground">
              You haven't added any contact details for your website.
            </p>
          </div>

          <Button type="button" onClick={() => navigate("/contact/create")}>
            Create Contact
          </Button>
        </div>
      </div>
    );
  }

  const whatsappDigits = toLocalDigits(contact.whatsappNumber);
  const whatsappLink = `https://wa.me/91${whatsappDigits}`;
  const isEmbedMap = contact.location.mapUrl.includes("/maps/embed");

  return (
    <div>
      <PageHeader
        title="Contact"
        description="Your website contact details."
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmDelete(true)}
            >
              Delete
            </Button>

            <Button type="button" onClick={() => navigate("/contact/edit")}>
              Edit Contact
            </Button>
          </>
        }
      />

      <div className="space-y-6">
        {deleteContactMutation.isError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">
              {getErrorMessage(
                deleteContactMutation.error,
                "Failed to delete contact details.",
              )}
            </p>
          </div>
        )}

        <section className="rounded-lg border">
          <div className="border-b p-6">
            <h2 className="text-lg font-semibold">Contact Information</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Phone numbers and email shown on your website.
            </p>
          </div>

          <dl className="divide-y">
            <Row label="Contact Number 1">
              <PhoneLink value={contact.contactNumber1} />
            </Row>

            <Row label="Contact Number 2">
              {contact.contactNumber2 ? (
                <PhoneLink value={contact.contactNumber2} />
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </Row>

            <Row label="WhatsApp">
              <a
                className={linkClass}
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                +91 {whatsappDigits}
              </a>
            </Row>

            <Row label="Email">
              <a className={linkClass} href={`mailto:${contact.email}`}>
                {contact.email}
              </a>
            </Row>
          </dl>
        </section>

        <section className="rounded-lg border">
          <div className="border-b p-6">
            <h2 className="text-lg font-semibold">Social Media</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Your social media profiles.
            </p>
          </div>

          {contact.socialMedia.length > 0 ? (
            <dl className="divide-y">
              {contact.socialMedia.map((item, index) => (
                <Row key={`${item.platform}-${index}`} label={item.platform}>
                  <a
                    className={linkClass}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {item.url}
                  </a>
                </Row>
              ))}
            </dl>
          ) : (
            <p className="p-6 text-sm text-muted-foreground">
              No social media links added.
            </p>
          )}
        </section>

        <section className="rounded-lg border">
          <div className="border-b p-6">
            <h2 className="text-lg font-semibold">Location</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Map location shown on your website.
            </p>
          </div>

          <div className="space-y-4 p-6">
            {isEmbedMap && (
              <div className="overflow-hidden rounded-lg border">
                <iframe
                  src={contact.location.mapUrl}
                  title="Location map"
                  className="h-72 w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}

            <a
              className={`${linkClass} inline-flex items-center gap-1 text-sm`}
              href={contact.location.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open in Maps
              <ExternalLink className="size-3.5" />
            </a>
          </div>
        </section>
      </div>

      <DeleteConfirmDialog
        open={confirmDelete}
        onOpenChange={(open) => {
          if (!open && !deleteContactMutation.isPending) {
            setConfirmDelete(false);
          }
        }}
        title="Delete Contact Details?"
        description="This will permanently remove your contact details from the website."
        itemName="Contact details"
        isDeleting={deleteContactMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
