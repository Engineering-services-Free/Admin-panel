import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";

import {
  useBlog,
  useCreateBlog,
  useUpdateBlog,
} from "@/hooks/services/useBlogs";
import { getErrorMessage } from "@/lib/getErrorMessage";

import type { CreateBlogInput } from "@/typings/blogs.typings";

import { BlogForm } from "./BlogForm";

export function BlogFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const isEditMode = Boolean(id);

  const blogQuery = useBlog(id ?? "");
  const createMutation = useCreateBlog();
  const updateMutation = useUpdateBlog();

  const [isUploading, setIsUploading] = useState(false);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const mutationError = createMutation.error ?? updateMutation.error;

  const goBack = () => navigate("/blogs");

  const handleSubmit = (values: CreateBlogInput) => {
    if (isEditMode && id) {
      updateMutation.mutate({ id, data: values }, { onSuccess: goBack });
      return;
    }

    createMutation.mutate(values, { onSuccess: goBack });
  };

  if (isEditMode && blogQuery.isLoading) {
    return (
      <div>
        <PageHeader title="Edit Blog" description="Loading blog..." />

        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (isEditMode && blogQuery.isError) {
    return (
      <div>
        <PageHeader title="Edit Blog" />

        <div className="space-y-6">
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6">
            <p className="text-sm text-destructive">
              {getErrorMessage(blogQuery.error, "Failed to load blog.")}
            </p>
          </div>

          <Button variant="outline" onClick={goBack}>
            Back to Blogs
          </Button>
        </div>
      </div>
    );
  }

  const blog = blogQuery.data?.data;

  if (isEditMode && !blog) {
    return (
      <div>
        <PageHeader title="Edit Blog" />

        <div className="space-y-6">
          <div className="rounded-lg border p-6">
            <p className="text-sm text-muted-foreground">Blog not found.</p>
          </div>

          <Button variant="outline" onClick={goBack}>
            Back to Blogs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={isEditMode ? "Edit Blog" : "Create Blog"}
        description={
          isEditMode
            ? "Update the blog details."
            : "Add a new blog article to your website."
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
              form="blog-form"
              disabled={isSubmitting || isUploading}
            >
              {isSubmitting
                ? "Saving..."
                : isEditMode
                  ? "Save Changes"
                  : "Create Blog"}
            </Button>
          </>
        }
      />

      <div className="space-y-6">
        {mutationError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">
              {getErrorMessage(mutationError, "Failed to save blog.")}
            </p>
          </div>
        )}

        <BlogForm
          key={id ?? "new"}
          initialValues={blog}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          onUploadingChange={setIsUploading}
        />
      </div>
    </div>
  );
}
