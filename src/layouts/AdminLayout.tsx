import { useState } from "react";
import { X } from "lucide-react";
import { Outlet } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function AdminLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-muted/20">
      {/* Sidebar */}
      <aside className="hidden h-screen shrink-0 lg:flex">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            onClick={closeMobileSidebar}
            aria-label="Close navigation menu"
          />

          <div className="relative z-10 h-full w-72 max-w-[85vw] border-r bg-background shadow-xl">
            <div className="absolute right-3 top-3 z-20">
              <Button
                variant="ghost"
                size="icon"
                onClick={closeMobileSidebar}
                aria-label="Close navigation menu"
              >
                <X className="size-5" />
              </Button>
            </div>

            <Sidebar onNavigate={closeMobileSidebar} />
          </div>
        </div>
      )}

      {/* Right Side */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Fixed Header */}
        <div className="shrink-0">
          <Header onMenuClick={() => setMobileSidebarOpen(true)} />
        </div>

        {/* Only this area scrolls */}
        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6">
            <Outlet />
          </div> 
        </main>
      </div>
    </div>
  );
}
