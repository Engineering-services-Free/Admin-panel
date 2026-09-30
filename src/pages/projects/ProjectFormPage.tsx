import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";

import {
  useCreateProject,
  useProject,
  useUpdateProject,
} from "@/hooks/services/useProjects";
import { getErrorMessage } from "@/lib/getErrorMessage";

import type { CreateProjectInput } from "@/typings/projects.typings";

import { ProjectForm } from "./ProjectForm";

export function ProjectFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const isEditMode = Boolean(id);

  const projectQuery = useProject(id ?? "");
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();

  const [isUploading, setIsUploading] = useState(false);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const mutationError = createMutation.error ?? updateMutation.error;

  const goBack = () => navigate("/projects");

  const handleSubmit = (values: CreateProjectInput) => {
    if (isEditMode && id) {
      updateMutation.mutate({ id, data: values }, { onSuccess: goBack });
      return;
    }

    createMutation.mutate(values, { onSuccess: goBack });
  };

  if (isEditMode && projectQuery.isLoading) {
    return (
      <div>
        <PageHeader title="Edit Project" description="Loading project..." />

        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (isEditMode && projectQuery.isError) {
    return (
      <div>
        <PageHeader title="Edit Project" />

        <div className="space-y-6">
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6">
            <p className="text-sm text-destructive">
              {getErrorMessage(projectQuery.error, "Failed to load project.")}
            </p>
          </div>

          <Button variant="outline" onClick={goBack}>
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  const project = projectQuery.data?.data;

  if (isEditMode && !project) {
    return (
      <div>
        <PageHeader title="Edit Project" />

        <div className="space-y-6">
          <div className="rounded-lg border p-6">
            <p className="text-sm text-muted-foreground">Project not found.</p>
          </div>

          <Button variant="outline" onClick={goBack}>
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={isEditMode ? "Edit Project" : "Create Project"}
        description={
          isEditMode
            ? "Update the project details."
            : "Add a new project to your website."
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
              form="project-form"
              disabled={isSubmitting || isUploading}
            >
              {isSubmitting
                ? "Saving..."
                : isEditMode
                  ? "Save Changes"
                  : "Create Project"}
            </Button>
          </>
        }
      />

      <div className="space-y-6">
        {mutationError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">
              {getErrorMessage(mutationError, "Failed to save project.")}
            </p>
          </div>
        )}

        <ProjectForm
          key={id ?? "new"}
          initialValues={project}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          onUploadingChange={setIsUploading}
        />
      </div>
    </div>
  );
}
