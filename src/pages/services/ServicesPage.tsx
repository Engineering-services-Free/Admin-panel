import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";

import ServiceFilters from "./ServiceFilters";
import ServiceList from "./ServiceList";

import type { GetServicesParams, Service } from "@/typings/services.typings";

import { useDeleteService, useServices } from "@/hooks/services/useServices";

import { DeleteConfirmDialog } from "@/components/common/DeleteConfirmDialog";
import { PageHeader } from "@/components/common/PageHeader";

export function ServicesPage() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState<GetServicesParams>({
    page: 1,
    limit: 10,
  });

  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

  const { data, isLoading, isError, error } = useServices(filters);

  const deleteServiceMutation = useDeleteService();

  // Edit

  const handleEdit = (service: Service) => {
    navigate(`/services/${service.id}/edit`);
  };

  // Delete

  const handleDelete = (service: Service) => {
    setServiceToDelete(service);
  };

  const handleConfirmDelete = async () => {
    if (!serviceToDelete) {
      return;
    }

    try {
      await deleteServiceMutation.mutateAsync(serviceToDelete.id);

      setServiceToDelete(null);
    } catch {
      // Error is available through deleteServiceMutation.error
    }
  };

  const handlePageChange = (page: number) => {
    setFilters((current) => ({
      ...current,
      page,
    }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Services"
        description="Manage your services."
        actions={
          <Button type="button" onClick={() => navigate("/services/new")}>
            Create Service
          </Button>
        }
      />

      <ServiceFilters filters={filters} onChange={setFilters} />

      {isError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            {error instanceof Error
              ? error.message
              : "Failed to load services."}
          </p>
        </div>
      )}

      {!isError && (
        <ServiceList
          services={data?.data ?? []}
          isLoading={isLoading}
          isDeleting={deleteServiceMutation.isPending}
          page={data?.pagination.page ?? filters.page ?? 1}
          totalPages={data?.pagination.totalPages ?? 1}
          hasNextPage={data?.pagination.hasNextPage ?? false}
          hasPreviousPage={data?.pagination.hasPreviousPage ?? false}
          onPageChange={handlePageChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <DeleteConfirmDialog
        open={Boolean(serviceToDelete)}
        onOpenChange={(open) => {
          if (!open && !deleteServiceMutation.isPending) {
            setServiceToDelete(null);
          }
        }}
        title="Delete Service?"
        description="This will permanently remove the service and its associated hero image from Firebase Storage."
        itemName={serviceToDelete?.title}
        isDeleting={deleteServiceMutation.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
