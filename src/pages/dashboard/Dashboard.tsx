import { BriefcaseBusiness, FileText, FolderKanban, Users } from "lucide-react";

import { useDashboard } from "@/hooks/services/useDashboard";
import { getErrorMessage } from "@/lib/getErrorMessage";

const stats = [
  { key: "services", title: "Services", icon: BriefcaseBusiness },
  { key: "projects", title: "Projects", icon: FolderKanban },
  { key: "clients", title: "Clients", icon: Users },
  { key: "blogs", title: "Blogs", icon: FileText },
] as const;

const recentSections = [
  { key: "services", title: "Latest Services" },
  { key: "projects", title: "Latest Projects" },
  { key: "clients", title: "Latest Clients" },
  { key: "blogs", title: "Latest Blogs" },
] as const;

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(new Date(value));
}

export function Dashboard() {
  const { data, isLoading, isError, error } = useDashboard();
  const dashboard = data?.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

        <p className="text-sm text-muted-foreground">
          Manage your Muthammal Engineering website content.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-xl border bg-background p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>

                <Icon className="size-5 text-muted-foreground" />
              </div>

              <p className="mt-3 text-2xl font-bold">
                {isLoading && !dashboard
                  ? "—"
                  : dashboard?.counts[stat.key] ?? "—"}
              </p>
            </div>
          );
        })}
      </div>

      {isError && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 p-4"
        >
          <p className="text-sm text-destructive">
            {getErrorMessage(error, "Failed to load dashboard data.")}
          </p>
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        {recentSections.map((section) => {
          const records = dashboard?.recent[section.key] ?? [];

          return (
            <section
              key={section.key}
              className="rounded-xl border bg-background p-5 shadow-sm"
            >
              <h2 className="text-lg font-semibold">{section.title}</h2>

              {isLoading && !dashboard ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  Loading records...
                </p>
              ) : isError && !dashboard ? (
                <p className="mt-4 text-sm text-destructive">
                  Unable to load records.
                </p>
              ) : records.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  No records yet.
                </p>
              ) : (
                <ul className="mt-4 divide-y">
                  {records.map((record) => (
                    <li
                      key={record.id}
                      className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {"name" in record ? record.name : record.title}
                        </p>
                        {"industry" in record && (
                          <p className="text-xs text-muted-foreground">
                            {record.industry}
                          </p>
                        )}
                      </div>
                      <time
                        className="shrink-0 text-xs text-muted-foreground"
                        dateTime={record.createdAt}
                      >
                        {formatDate(record.createdAt)}
                      </time>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
