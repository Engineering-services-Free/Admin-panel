export interface DashboardRecord {
  id: string;
  createdAt: string;
}

export interface DashboardServiceRecord extends DashboardRecord {
  title: string;
  slug: string;
  status: "draft" | "published" | "archived";
}

export interface DashboardProjectRecord extends DashboardRecord {
  title: string;
  slug: string;
  status: "draft" | "published" | "archived";
  year: number;
}

export interface DashboardClientRecord extends DashboardRecord {
  name: string;
  industry: string;
}

export interface DashboardBlogRecord extends DashboardRecord {
  title: string;
  slug: string;
  status: "draft" | "published" | "archived";
}

export interface DashboardData {
  counts: {
    services: number;
    projects: number;
    clients: number;
    blogs: number;
  };
  recent: {
    services: DashboardServiceRecord[];
    projects: DashboardProjectRecord[];
    clients: DashboardClientRecord[];
    blogs: DashboardBlogRecord[];
  };
}

export interface GetDashboardResponse {
  success: true;
  message: string;
  data: DashboardData;
}
