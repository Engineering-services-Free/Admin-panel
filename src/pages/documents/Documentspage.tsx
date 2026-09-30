import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, FileText, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/common/PageHeader";
import { DeleteConfirmDialog } from "@/components/common/DeleteConfirmDialog";

import { useDeleteDocument, useDocuments } from "@/hooks/services/useDocuments";
import { useClients } from "@/hooks/services/useClients";
import { getErrorMessage } from "@/lib/getErrorMessage";

import type {
  Document as DocumentItem,
  DocumentType,
  DocumentVisibility,
  GetDocumentsParams,
} from "@/typings/documents.typings";

import { DOCUMENT_TYPE_LABELS } from "./Documentform";

const VISIBILITY_STYLES: Record<DocumentVisibility, string> = {
  public: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  internal: "bg-muted text-muted-foreground",
};

const selectClass =
  "h-9 rounded-md border border-input bg-background px-3 text-sm";

function formatDate(value?: string) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function DocumentsPage() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState<GetDocumentsParams>({
    page: 1,
    limit: 12,
  });
  const [documentToDelete, setDocumentToDelete] = useState<DocumentItem | null>(
    null,
  );

  const { data, isLoading, isError, error } = useDocuments(filters);
  const clientsQuery = useClients({ page: 1, limit: 100 });
  const deleteMutation = useDeleteDocument();

  const documents = data?.data ?? [];
  const pagination = data?.pagination;

  const clientNames = useMemo(
    () => new Map((clientsQuery.data?.data ?? []).map((c) => [c.id, c.name])),
    [clientsQuery.data],
  );

  const handleConfirmDelete = async () => {
    if (!documentToDelete) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(documentToDelete.id);

      if (documents.length === 1 && (filters.page ?? 1) > 1) {
        setFilters((current) => ({
          ...current,
          page: (current.page ?? 1) - 1,
        }));
      }

      setDocumentToDelete(null);
    } catch {
      // Error is available through deleteMutation.error
    }
  };

  const hasFilters = Boolean(
    filters.type || filters.visibility || filters.clientId,
  );

  return (
    <div>
      <PageHeader
        title="Documents"
        description="Manage brochures, certificates and other files."
        actions={
          <Button type="button" onClick={() => navigate("/documents/create")}>
            Create Document
          </Button>
        }
      />

      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            aria-label="Filter by type"
            value={filters.type ?? ""}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                type: (event.target.value || undefined) as
                  | DocumentType
                  | undefined,
                page: 1,
              }))
            }
            className={selectClass}
          >
            <option value="">All types</option>
            {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by visibility"
            value={filters.visibility ?? ""}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                visibility: (event.target.value || undefined) as
                  | DocumentVisibility
                  | undefined,
                page: 1,
              }))
            }
            className={selectClass}
          >
            <option value="">All visibility</option>
            <option value="public">Public</option>
            <option value="internal">Internal</option>
          </select>

          <select
            aria-label="Filter by client"
            value={filters.clientId ?? ""}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                clientId: event.target.value || undefined,
                page: 1,
              }))
            }
            className={`${selectClass} sm:w-56`}
          >
            <option value="">
              {clientsQuery.isLoading ? "Loading clients..." : "All clients"}
            </option>
            {(clientsQuery.data?.data ?? []).map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>

        {isError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">
              {getErrorMessage(error, "Failed to load documents.")}
            </p>
          </div>
        )}

        {deleteMutation.isError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">
              {getErrorMessage(
                deleteMutation.error,
                "Failed to delete document.",
              )}
            </p>
          </div>
        )}

        {isLoading && (
          <div className="rounded-lg border p-6">
            <p className="text-sm text-muted-foreground">
              Loading documents...
            </p>
          </div>
        )}

        {!isLoading && !isError && documents.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed px-6 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <FileText className="size-6 text-muted-foreground" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-semibold">No documents found</h2>
              <p className="text-sm text-muted-foreground">
                {hasFilters
                  ? "No documents match these filters."
                  : "You haven't added any documents yet."}
              </p>
            </div>

            {!hasFilters && (
              <Button
                type="button"
                onClick={() => navigate("/documents/create")}
              >
                Create Document
              </Button>
            )}
          </div>
        )}

        {documents.length > 0 && (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Order</TableHead>
                  <TableHead>Document Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {documents.map((document) => (
                  <TableRow key={document.id}>
                    <TableCell className="font-medium tabular-nums">
                      {document.order}
                    </TableCell>

                    <TableCell className="max-w-xs">
                      <span className="block truncate font-medium">
                        {document.title}
                      </span>

                      {document.description && (
                        <p className="truncate text-xs text-muted-foreground">
                          {document.description}
                        </p>
                      )}
                    </TableCell>

                    <TableCell className="whitespace-nowrap text-sm">
                      {DOCUMENT_TYPE_LABELS[document.type]}
                    </TableCell>

                    <TableCell className="max-w-[12rem] truncate text-sm">
                      {document.clientId
                        ? (clientNames.get(document.clientId) ??
                          (clientsQuery.isLoading ? "Loading..." : "—"))
                        : "—"}
                    </TableCell>

                    <TableCell>
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${VISIBILITY_STYLES[document.visibility]}`}
                      >
                        {document.visibility}
                      </span>
                    </TableCell>

                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {formatDate(document.updatedAt)}
                    </TableCell>

                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          aria-label={`Open ${document.title}`}
                          title="Open file"
                          onClick={() =>
                            window.open(
                              document.file.url,
                              "_blank",
                              "noopener,noreferrer",
                            )
                          }
                        >
                          <Eye className="size-4" />
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          aria-label={`Edit ${document.title}`}
                          title="Edit"
                          onClick={() =>
                            navigate(`/documents/${document.id}/edit`)
                          }
                        >
                          <Pencil className="size-4" />
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          aria-label={`Delete ${document.title}`}
                          title="Delete"
                          onClick={() => setDocumentToDelete(document)}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

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
        open={Boolean(documentToDelete)}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) {
            setDocumentToDelete(null);
          }
        }}
        title="Delete Document?"
        description="This will permanently remove the document and its file from Firebase Storage."
        itemName={documentToDelete?.title}
        isDeleting={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
