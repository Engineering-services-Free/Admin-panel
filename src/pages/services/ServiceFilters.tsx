import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { GetServicesParams } from "@/typings/services.typings";

interface ServiceFiltersProps {
  filters: GetServicesParams;
  onChange: (filters: GetServicesParams) => void;
}

export default function ServiceFilters({
  filters,
  onChange,
}: ServiceFiltersProps) {
  const handleStatusChange = (value: string | null) => {
    if (value === null) {
      return;
    }

    onChange({
      ...filters,
      page: 1,
      status:
        value === "all" ? undefined : (value as GetServicesParams["status"]),
    });
  };

  const handleFeaturedChange = (value: string | null) => {
    if (value === null) {
      return;
    }

    onChange({
      ...filters,
      page: 1,
      featured: value === "all" ? undefined : value === "true",
    });
  };

  const handleLimitChange = (value: string | null) => {
    if (value === null) {
      return;
    }

    onChange({
      ...filters,
      page: 1,
      limit: Number(value),
    });
  };

  return (
    <div className="flex flex-wrap items-end gap-4">
      {/* Status */}
      <div className="flex flex-col gap-2">
        <label htmlFor="service-status" className="text-sm font-medium">
          Status
        </label>

        <Select
          value={filters.status ?? "all"}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger id="service-status" className="w-40">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all" >All</SelectItem>

            <SelectItem value="draft" >Draft</SelectItem>

            <SelectItem value="published" >Published</SelectItem>

            <SelectItem value="archived" >Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Featured */}
      <div className="flex flex-col gap-2">
        <label htmlFor="service-featured" className="text-sm font-medium">
          Featured
        </label>

        <Select
          value={
            filters.featured === undefined ? "all" : String(filters.featured)
          }
          
          onValueChange={handleFeaturedChange}
        >
          <SelectTrigger id="service-featured" className="w-32">
            <SelectValue placeholder="Featured" />
          </SelectTrigger>

          <SelectContent >
            <SelectItem value="all" >All</SelectItem>

            <SelectItem value="true" >Yes</SelectItem>

            <SelectItem value="false" >No</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Per Page */}
      <div className="flex flex-col gap-2">
        <label htmlFor="service-limit" className="text-sm font-medium">
          Per page
        </label>

        <Select
          value={String(filters.limit ?? 10)}
          onValueChange={handleLimitChange}
        >
          <SelectTrigger id="service-limit" className="w-24">
            <SelectValue placeholder="Limit" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="10" >10</SelectItem>

            <SelectItem value="20" >20</SelectItem>

            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
