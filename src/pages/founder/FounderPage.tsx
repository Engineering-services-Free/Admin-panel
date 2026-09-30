import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";
import { DeleteConfirmDialog } from "@/components/common/DeleteConfirmDialog";
import { RichTextContent } from "@/components/common/RichTextContent";

import { useDeleteFounder, useFounders } from "@/hooks/services/useFounder";
import { getErrorMessage } from "@/lib/getErrorMessage";

import type { Founder } from "@/typings/founder.typings";

export function FounderPage() {
  const navigate = useNavigate();

  const [founderToDelete, setFounderToDelete] = useState<Founder | null>(null);

  const { data, isLoading, isError, error } = useFounders();
  const deleteFounderMutation = useDeleteFounder();

  const founders = useMemo(
    () => [...(data?.data ?? [])].sort((a, b) => a.order - b.order),
    [data],
  );

  const handleConfirmDelete = async () => {
    if (!founderToDelete) {
      return;
    }

    try {
      await deleteFounderMutation.mutateAsync(founderToDelete.id);
      setFounderToDelete(null);
    } catch {
      // Error is available through deleteFounderMutation.error
    }
  };

  return (
    <div>
      <PageHeader
        title="Founder"
        description="Manage the founders shown on your website."
        actions={
          <Button type="button" onClick={() => navigate("/founder/create")}>
            Add Founder
          </Button>
        }
      />

      <div className="space-y-6">
        {isError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">
              {getErrorMessage(error, "Failed to load founders.")}
            </p>
          </div>
        )}

        {deleteFounderMutation.isError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">
              {getErrorMessage(
                deleteFounderMutation.error,
                "Failed to delete founder.",
              )}
            </p>
          </div>
        )}

        {isLoading && (
          <div className="rounded-lg border p-6">
            <p className="text-sm text-muted-foreground">Loading founders...</p>
          </div>
        )}

        {!isLoading && !isError && founders.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed px-6 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <User className="size-6 text-muted-foreground" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-semibold">No founders yet</h2>
              <p className="text-sm text-muted-foreground">
                You haven't added any founders for your website.
              </p>
            </div>

            <Button type="button" onClick={() => navigate("/founder/create")}>
              Add Founder
            </Button>
          </div>
        )}

        {founders.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {founders.map((founder) => (
              <div
                key={founder.id}
                className="flex flex-col overflow-hidden rounded-lg border"
              >
                <div className="relative h-56 bg-muted/40">
                  <img
                    src={founder.image.url}
                    alt={founder.image.alt}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />

                  <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-0.5 text-xs font-medium shadow-sm">
                    Order {founder.order}
                  </span>
                </div>

                <div className="flex flex-1 flex-col gap-4 p-4">
                  <div className="min-w-0 space-y-2">
                    <h3 className="truncate font-semibold">{founder.name}</h3>

                    <RichTextContent
                      html={founder.overview}
                      className="max-h-48 overflow-y-auto pr-1"
                    />
                  </div>

                  <div className="mt-auto flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/founder/${founder.id}/edit`)}
                    >
                      <Pencil className="mr-2 size-4" />
                      Edit
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      aria-label={`Delete ${founder.name}`}
                      onClick={() => setFounderToDelete(founder)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <DeleteConfirmDialog
        open={Boolean(founderToDelete)}
        onOpenChange={(open) => {
          if (!open && !deleteFounderMutation.isPending) {
            setFounderToDelete(null);
          }
        }}
        title="Delete Founder?"
        description="This will permanently remove the founder and their photo from Firebase Storage."
        itemName={founderToDelete?.name}
        isDeleting={deleteFounderMutation.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
