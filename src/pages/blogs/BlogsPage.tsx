import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, FileText, Pencil, Star, Trash2 } from "lucide-react";

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

import { useBlogs, useDeleteBlog } from "@/hooks/services/useBlogs";
import { useProjects } from "@/hooks/services/useProjects";
import { getErrorMessage } from "@/lib/getErrorMessage";

import type { Blog, BlogStatus, GetBlogsParams } from "@/typings/blogs.typings";

const STATUS_STYLES: Record<BlogStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  published: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  archived: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
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

export function BlogsPage() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState<GetBlogsParams>({
    page: 1,
    limit: 12,
  });
  const [blogToDelete, setBlogToDelete] = useState<Blog | null>(null);

  const { data, isLoading, isError, error } = useBlogs(filters);
  const deleteMutation = useDeleteBlog();

  const projectsQuery = useProjects({ page: 1, limit: 100 });
  const projectList = projectsQuery.data?.data ?? [];

  const projectTitles = useMemo(
    () => new Map(projectList.map((project) => [project.id, project.title])),
    [projectList],
  );

  const blogs = data?.data ?? [];
  const pagination = data?.pagination;
  const hasFilters = Boolean(filters.status || filters.projectId);

  const handleConfirmDelete = async () => {
    if (!blogToDelete) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(blogToDelete.id);

      if (blogs.length === 1 && (filters.page ?? 1) > 1) {
        setFilters((current) => ({
          ...current,
          page: (current.page ?? 1) - 1,
        }));
      }

      setBlogToDelete(null);
    } catch {
      // Error is available through deleteMutation.error
    }
  };

  return (
    <div>
      <PageHeader
        title="Blogs"
        description="Manage the blog articles shown on your website."
        actions={
          <Button type="button" onClick={() => navigate("/blogs/create")}>
            Create Blog
          </Button>
        }
      />

      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            aria-label="Filter by project"
            value={filters.projectId ?? ""}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                projectId: event.target.value || undefined,
                page: 1,
              }))
            }
            className={`${selectClass} sm:w-64`}
          >
            <option value="">All projects</option>
            {projectList.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by status"
            value={filters.status ?? ""}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                status: (event.target.value || undefined) as
                  | BlogStatus
                  | undefined,
                page: 1,
              }))
            }
            className={selectClass}
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
              {getErrorMessage(error, "Failed to load blogs.")}
            </p>
          </div>
        )}

        {deleteMutation.isError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">
              {getErrorMessage(deleteMutation.error, "Failed to delete blog.")}
            </p>
          </div>
        )}

        {isLoading && (
          <div className="rounded-lg border p-6">
            <p className="text-sm text-muted-foreground">Loading blogs...</p>
          </div>
        )}

        {!isLoading && !isError && blogs.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed px-6 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <FileText className="size-6 text-muted-foreground" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-semibold">No blogs found</h2>
              <p className="text-sm text-muted-foreground">
                {hasFilters
                  ? "No blogs match these filters."
                  : "You haven't added any blogs yet."}
              </p>
            </div>

            {!hasFilters && (
              <Button type="button" onClick={() => navigate("/blogs/create")}>
                Create Blog
              </Button>
            )}
          </div>
        )}

        {blogs.length > 0 && (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Order</TableHead>
                  <TableHead>Blog</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {blogs.map((blog) => (
                  <TableRow key={blog.id}>
                    <TableCell className="font-medium tabular-nums">
                      {blog.order}
                    </TableCell>

                    <TableCell className="max-w-xs">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium">
                          {blog.title}
                        </span>

                        {blog.featured && (
                          <Star
                            className="size-3.5 shrink-0 fill-current text-amber-500"
                            aria-label="Featured"
                          />
                        )}
                      </div>

                      <p className="truncate text-xs text-muted-foreground">
                        {blog.readingTime} min read
                      </p>
                    </TableCell>

                    <TableCell className="max-w-[12rem] truncate text-sm">
                      {projectTitles.get(blog.projectId) ??
                        (projectsQuery.isLoading ? "Loading..." : "—")}
                    </TableCell>

                    <TableCell>
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[blog.status]}`}
                      >
                        {blog.status}
                      </span>
                    </TableCell>

                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {formatDate(blog.updatedAt)}
                    </TableCell>

                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          disabled
                          aria-label={`View ${blog.title}`}
                          title="View (coming soon)"
                        >
                          <Eye className="size-4" />
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          aria-label={`Edit ${blog.title}`}
                          title="Edit"
                          onClick={() => navigate(`/blogs/${blog.id}/edit`)}
                        >
                          <Pencil className="size-4" />
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          aria-label={`Delete ${blog.title}`}
                          title="Delete"
                          onClick={() => setBlogToDelete(blog)}
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
        open={Boolean(blogToDelete)}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) {
            setBlogToDelete(null);
          }
        }}
        title="Delete Blog?"
        description="This will permanently remove the blog and its cover image from Firebase Storage."
        itemName={blogToDelete?.title}
        isDeleting={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
