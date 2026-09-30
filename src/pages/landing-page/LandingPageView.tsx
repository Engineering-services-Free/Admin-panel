import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { LayoutTemplate } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";
import { DeleteConfirmDialog } from "@/components/common/DeleteConfirmDialog";
import { RichTextContent } from "@/components/common/RichTextContent";

import {
  useDeleteLandingPage,
  useLandingPage,
} from "@/hooks/services/useLandingPage";
import { getErrorMessage } from "@/lib/getErrorMessage";

export function LandingPageView() {
  const navigate = useNavigate();

  const landingQuery = useLandingPage();
  const deleteMutation = useDeleteLandingPage();

  const [confirmDelete, setConfirmDelete] = useState(false);

  const landing = landingQuery.data?.data;

  const isNotFound =
    landingQuery.isError &&
    axios.isAxiosError(landingQuery.error) &&
    landingQuery.error.response?.status === 404;

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync();
      setConfirmDelete(false);
    } catch {
      // Error is available through deleteMutation.error
    }
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
        <PageHeader
          title="Landing Page"
          description="Manage your landing page content."
        />

        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6">
          <p className="text-sm text-destructive">
            {getErrorMessage(
              landingQuery.error,
              "Failed to load landing page content.",
            )}
          </p>
        </div>
      </div>
    );
  }

  if (isNotFound || !landing) {
    return (
      <div>
        <PageHeader
          title="Landing Page"
          description="Manage your landing page content."
        />

        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed px-6 py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <LayoutTemplate className="size-6 text-muted-foreground" />
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-semibold">
              No landing page content yet
            </h2>
            <p className="text-sm text-muted-foreground">
              You haven't added any landing page content for your website.
            </p>
          </div>

          <Button
            type="button"
            onClick={() => navigate("/landing-page/create")}
          >
            Create Landing Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Landing Page"
        description="Your website landing page content."
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmDelete(true)}
            >
              Delete
            </Button>

            <Button
              type="button"
              onClick={() => navigate("/landing-page/edit")}
            >
              Edit Landing Page
            </Button>
          </>
        }
      />

      <div className="space-y-6">
        {deleteMutation.isError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">
              {getErrorMessage(
                deleteMutation.error,
                "Failed to delete landing page content.",
              )}
            </p>
          </div>
        )}

        {/* Hero */}
        <section className="rounded-lg border">
          <div className="border-b p-6">
            <h2 className="text-lg font-semibold">Hero</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The headline section at the top of your website.
            </p>
          </div>

          <div className="space-y-2 p-6">
            <h3 className="text-2xl font-semibold tracking-tight">
              {landing.hero.title}
            </h3>

            {landing.hero.description ? (
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {landing.hero.description}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                No hero description added.
              </p>
            )}
          </div>
        </section>

        {/* What We Do */}
        <section className="rounded-lg border">
          <div className="border-b p-6">
            <h2 className="text-lg font-semibold">What We Do</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              What the company does and its capabilities.
            </p>
          </div>

          <div className="p-6">
            <RichTextContent html={landing.whatWeDo} />
          </div>
        </section>
      </div>

      <DeleteConfirmDialog
        open={confirmDelete}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) {
            setConfirmDelete(false);
          }
        }}
        title="Delete Landing Page Content?"
        description="This will permanently remove the landing page content from the website."
        itemName="Landing page content"
        isDeleting={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
