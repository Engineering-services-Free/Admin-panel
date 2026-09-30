import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, FolderKanban, Pencil, Star, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

import { useDeleteProject, useProjects } from "@/hooks/services/useProjects";
import { getErrorMessage } from "@/lib/getErrorMessage";

import type {
  GetProjectsParams,
  Project,
  ProjectStatus,
} from "@/typings/projects.typings";
import { useClients } from "@/hooks/services/useClients";

const STATUS_STYLES: Record<ProjectStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  published: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  archived: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
};

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

export function ProjectsPage() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState<GetProjectsParams>({
    page: 1,
    limit: 12,
  });
  const [industryInput, setIndustryInput] = useState("");
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const { data, isLoading, isError, error } = useProjects(filters);
  const clientsQuery = useClients({ page: 1, limit: 100 });
  const deleteMutation = useDeleteProject();

  const projects = data?.data ?? [];
  const pagination = data?.pagination;

  const clientNames = useMemo(
    () => new Map((clientsQuery.data?.data ?? []).map((c) => [c.id, c.name])),
    [clientsQuery.data],
  );

  // Apply the industry filter 400ms after typing stops
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
    if (!projectToDelete) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(projectToDelete.id);

      if (projects.length === 1 && (filters.page ?? 1) > 1) {
        setFilters((current) => ({
          ...current,
          page: (current.page ?? 1) - 1,
        }));
      }

      setProjectToDelete(null);
    } catch {
      // Error is available through deleteMutation.error
    }
  };

  const hasFilters = Boolean(filters.industry || filters.status);

  return (
    <div>
      <PageHeader
        title="Projects"
        description="Manage the projects shown on your website."
        actions={
          <Button type="button" onClick={() => navigate("/projects/create")}>
            Create Project
          </Button>
        }
      />

      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="sm:w-72">
            <Input
              value={industryInput}
              onChange={(event) => setIndustryInput(event.target.value)}
              placeholder="Filter by industry..."
            />
          </div>

          <select
            aria-label="Filter by status"
            value={filters.status ?? ""}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                status: (event.target.value || undefined) as
                  | ProjectStatus
                  | undefined,
                page: 1,
              }))
            }
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {isError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">
              {getErrorMessage(error, "Failed to load projects.")}
            </p>
          </div>
        )}

        {deleteMutation.isError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">
              {getErrorMessage(
                deleteMutation.error,
                "Failed to delete project.",
              )}
            </p>
          </div>
        )}

        {isLoading && (
          <div className="rounded-lg border p-6">
            <p className="text-sm text-muted-foreground">Loading projects...</p>
          </div>
        )}

        {!isLoading && !isError && projects.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed px-6 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <FolderKanban className="size-6 text-muted-foreground" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-semibold">No projects found</h2>
              <p className="text-sm text-muted-foreground">
                {hasFilters
                  ? "No projects match these filters."
                  : "You haven't added any projects yet."}
              </p>
            </div>

            {!hasFilters && (
              <Button
                type="button"
                onClick={() => navigate("/projects/create")}
              >
                Create Project
              </Button>
            )}
          </div>
        )}

        {projects.length > 0 && (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Order</TableHead>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium tabular-nums">
                      {project.order}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium">
                          {project.title}
                        </span>

                        {project.featured && (
                          <Star
                            className="size-3.5 shrink-0 fill-current text-amber-500"
                            aria-label="Featured"
                          />
                        )}
                      </div>

                      <p className="truncate text-xs text-muted-foreground">
                        {project.industry} · {project.year}
                      </p>
                    </TableCell>

                    <TableCell className="max-w-[12rem] truncate text-sm">
                      {clientNames.get(project.clientId) ??
                        (clientsQuery.isLoading ? "Loading..." : "—")}
                    </TableCell>

                    <TableCell>
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[project.status]}`}
                      >
                        {project.status}
                      </span>
                    </TableCell>

                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {formatDate(project.updatedAt)}
                    </TableCell>

                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          disabled
                          aria-label={`View ${project.title}`}
                          title="View (coming soon)"
                        >
                          <Eye className="size-4" />
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          aria-label={`Edit ${project.title}`}
                          title="Edit"
                          onClick={() =>
                            navigate(`/projects/${project.id}/edit`)
                          }
                        >
                          <Pencil className="size-4" />
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          aria-label={`Delete ${project.title}`}
                          title="Delete"
                          onClick={() => setProjectToDelete(project)}
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
        open={Boolean(projectToDelete)}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) {
            setProjectToDelete(null);
          }
        }}
        title="Delete Project?"
        description="This will permanently remove the project and all its images from Firebase Storage."
        itemName={projectToDelete?.title}
        isDeleting={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
