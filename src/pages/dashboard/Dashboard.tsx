import { BriefcaseBusiness, FolderKanban, Users, FileText } from "lucide-react";

const stats = [
  {
    title: "Services",
    value: "0",
    icon: BriefcaseBusiness,
  },
  {
    title: "Projects",
    value: "0",
    icon: FolderKanban,
  },
  {
    title: "Clients",
    value: "0",
    icon: Users,
  },
  {
    title: "Blogs",
    value: "0",
    icon: FileText,
  },
];

export function Dashboard() {
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

              <p className="mt-3 text-2xl font-bold">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border bg-background p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Welcome to the Admin Panel</h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Use the sidebar to manage services, projects, clients, blogs and other
          website content.
        </p>
      </div>
    </div>
  );
}
