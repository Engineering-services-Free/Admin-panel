import {
  LayoutDashboard,
  BriefcaseBusiness,
  FolderKanban,
  Users,
  FileText,
  UserRound,
  Info,
  PanelsTopLeft,
  MessageSquare,
  FileDown,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const navigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Services",
    href: "/services",
    icon: BriefcaseBusiness,
  },
  {
    title: "Projects",
    href: "/projects",
    icon: FolderKanban,
  },
  {
    title: "Clients",
    href: "/clients",
    icon: Users,
  },
  {
    title: "Blogs",
    href: "/blogs",
    icon: FileText,
  },
  {
    title: "Founder",
    href: "/founder",
    icon: UserRound,
  },
  {
    title: "About",
    href: "/about",
    icon: Info,
  },
  {
    title: "Landing Page",
    href: "/landing-page",
    icon: PanelsTopLeft,
  },
  {
    title: "Contact",
    href: "/contact",
    icon: MessageSquare,
  },
  {
    title: "Documents",
    href: "/documents",
    icon: FileDown,
  },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  return (
    <aside className="flex h-full w-64 flex-col bg-background">
      <div className="flex h-16 shrink-0 items-center border-b px-6">
        <h1 className="text-lg font-semibold">Muthammal Engineering</h1>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navigationItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={onNavigate}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                ].join(" ")
              }
            >
              <Icon className="size-4 shrink-0" />
              <span>{item.title}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
