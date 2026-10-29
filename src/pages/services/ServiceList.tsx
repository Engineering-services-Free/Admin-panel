import { GripVertical, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { Service } from "@/typings/services.typings";
import { useOrderDrag } from "@/hooks/useOrderDrag";

interface ServiceListProps {
  services: Service[];
  isLoading: boolean;
  isDeleting: boolean;

  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;

  onPageChange: (page: number) => void;
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
  canReorder: boolean;
  isReordering: boolean;
  firstOrder: number;
  onReorder: (id: string, order: number) => Promise<unknown>;
}

export default function ServiceList({
  services,
  isLoading,
  isDeleting,
  page,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
  onEdit,
  onDelete,
  canReorder,
  isReordering,
  firstOrder,
  onReorder,
}: ServiceListProps) {
  const { rowProps } = useOrderDrag({
    items: services,
    enabled: canReorder && !isReordering && !isLoading,
    firstPosition: firstOrder,
    onMove: onReorder,
  });

  if (isLoading) {
    return (
      <div className="rounded-lg border">
        <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
          Loading services...
        </div>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="rounded-lg border">
        <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
          No services found.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {services.map((service, index) => (
              <TableRow key={service.id} {...rowProps(service.id, index)}>
                {/* Service */}
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{service.title}</span>

                    <span className="text-xs text-muted-foreground">
                      /{service.slug}
                    </span>
                  </div>
                </TableCell>

                {/* Status */}
                <TableCell>
                  <StatusBadge status={service.status} />
                </TableCell>

                {/* Featured */}
                <TableCell>
                  {service.featured ? (
                    <Badge variant="secondary">Yes</Badge>
                  ) : (
                    <Badge variant="outline">No</Badge>
                  )}
                </TableCell>

                {/* Order */}
                <TableCell>
                  <span className="flex items-center gap-1.5 tabular-nums">
                    {canReorder && (
                      <GripVertical
                        className="size-4 cursor-grab text-muted-foreground active:cursor-grabbing"
                        aria-hidden="true"
                      />
                    )}
                    {service.order}
                  </span>
                </TableCell>

                {/* Updated */}
                <TableCell>
                  {service.updatedAt
                    ? new Date(service.updatedAt).toLocaleDateString()
                    : "-"}
                </TableCell>

                {/* Actions */}
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(service)}
                      aria-label={`Edit ${service.title}`}
                    >
                      <Pencil />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(service)}
                      disabled={isDeleting}
                      aria-label={`Delete ${service.title}`}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </p>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!hasPreviousPage}
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={!hasNextPage}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Service["status"] }) {
  switch (status) {
    case "published":
      return <Badge>Published</Badge>;

    case "draft":
      return <Badge variant="secondary">Draft</Badge>;

    case "archived":
      return <Badge variant="outline">Archived</Badge>;

    default:
      return null;
  }
}
