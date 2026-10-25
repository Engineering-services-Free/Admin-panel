import { apiClient } from "./client";

import type { GetDashboardResponse } from "@/typings/dashboard.typings";

export function getDashboard(): Promise<GetDashboardResponse> {
  return apiClient
    .get<GetDashboardResponse>("/admin/dashboard")
    .then((response) => response.data);
}
