import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/common/PageHeader";
import { DeleteConfirmDialog } from "@/components/common/DeleteConfirmDialog";

import { useClients, useDeleteClient } from "@/hooks/services/useClients";

import type { Client, GetClientsParams } from "@/typings/clients.typings";

export function ClientsPage() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState<GetClientsParams>({
    page: 1,
    limit: 12,
  });

  const [industryInput, setIndustryInput] = useState("");
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  const { data, isLoading, isError, error } = useClients(filters);
  const deleteClientMutation = useDeleteClient();

  const clients = data?.data ?? [];
  const pagination = data?.pagination;

  // Apply the industry filter 400ms after the admin stops typing
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const industry = industryInput.trim();

      setFilters((current) => {
        if ((current.industry ?? "") === industry) {
          return current;
        }

        return { ...current, industry: industry || undefined, page: 1 };
      });
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [industryInput]);

  const handleConfirmDelete = async () => {
    if (!clientToDelete) {
      return;
    }

    try {
      await deleteClientMutation.mutateAsync(clientToDelete.id);

      // If that was the last card on this page, go back one page
      if (clients.length === 1 && (filters.page ?? 1) > 1) {
        setFilters((current) => ({
          ...current,
          page: (current.page ?? 1) - 1,
        }));
      }

      setClientToDelete(null);
    } catch {
      // Error is available through deleteClientMutation.error
    }
  };

  return (
    <div>
      <PageHeader
        title="Clients"
        description="Manage the clients shown on your website."
        actions={
          <Button type="button" onClick={() => navigate("/clients/create")}>
            Create Client
          </Button>
        }
      />

      <div className="space-y-6">
        {/* Filter */}
        <div className="max-w-sm">
          <Input
            value={industryInput}
            onChange={(event) => setIndustryInput(event.target.value)}
            placeholder="Filter by industry..."
          />
        </div>

        {/* Error */}
        {isError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">
              {error instanceof Error
                ? error.message
                : "Failed to load clients."}
            </p>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="rounded-lg border p-6">
            <p className="text-sm text-muted-foreground">Loading clients...</p>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && clients.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed px-6 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <Building2 className="size-6 text-muted-foreground" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-semibold">No clients found</h2>
              <p className="text-sm text-muted-foreground">
                {filters.industry
                  ? "No clients match this industry."
                  : "You haven't added any clients yet."}
              </p>
            </div>

            {!filters.industry && (
              <Button type="button" onClick={() => navigate("/clients/create")}>
                Create Client
              </Button>
            )}
          </div>
        )}

        {/* Grid */}
        {clients.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {clients.map((client) => (
              <div
                key={client.id}
                className="flex flex-col overflow-hidden rounded-lg border"
              >
                <div className="flex h-36 items-center justify-center border-b bg-muted/40 p-4">
                  <img
                    src={client.image.url}
                    alt={client.image.alt}
                    className="max-h-full max-w-full object-contain"
                    loading="lazy"
                  />
                </div>

                <div className="flex flex-1 flex-col gap-4 p-4">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold">{client.name}</h3>
                    <p className="truncate text-sm text-muted-foreground">
                      {client.industry}
                    </p>
                  </div>

                  <div className="mt-auto flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/clients/${client.id}/edit`)}
                    >
                      <Pencil className="mr-2 size-4" />
                      Edit
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      aria-label={`Delete ${client.name}`}
                      onClick={() => setClientToDelete(client)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </p>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!pagination.hasPreviousPage}
                onClick={() =>
                  setFilters((current) => ({
                    ...current,
                    page: (current.page ?? 1) - 1,
                  }))
                }
              >
                Previous
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!pagination.hasNextPage}
                onClick={() =>
                  setFilters((current) => ({
                    ...current,
                    page: (current.page ?? 1) + 1,
                  }))
                }
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <DeleteConfirmDialog
        open={Boolean(clientToDelete)}
        onOpenChange={(open) => {
          if (!open && !deleteClientMutation.isPending) {
            setClientToDelete(null);
          }
        }}
        title="Delete Client?"
        description="This will permanently remove the client and its logo from Firebase Storage."
        itemName={clientToDelete?.name}
        isDeleting={deleteClientMutation.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
