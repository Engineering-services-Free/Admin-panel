import { Navigate, Route, Routes } from "react-router-dom";

import { AdminLayout } from "@/layouts/AdminLayout";
import { ProtectedRoute } from "@/routes/ProtectedRoute";

import { Login } from "@/pages/auth/Login";
import { ChangePassword } from "@/pages/auth/ChangePassword";
import { Dashboard } from "@/pages/dashboard/Dashboard";
import RichTextEditorTest from "@/pages/test/RichTextEditorTest";
import { ServicesPage } from "@/pages/services/ServicesPage";
import { ServiceFormPage } from "@/pages/services/ServiceFormPage";
import { AboutPage } from "@/pages/about/AboutPage";
import { AboutFormPage } from "@/pages/about/AboutFormPage";
import { ClientsPage } from "@/pages/clients/ClientsPage";
import { ClientFormPage } from "@/pages/clients/ClientFormPage";
import { FounderFormPage } from "@/pages/founder/FounderFormPage";
import { FounderPage } from "@/pages/founder/FounderPage";
import { ContactFormPage } from "@/pages/contacts/ContactFormPage";
import { ContactPage } from "@/pages/contacts/ContactPage";
import { LandingPageView } from "@/pages/landing-page/LandingPageView";
import { LandingPageFormPage } from "@/pages/landing-page/LandingPageFormPage";
import { ProjectsPage } from "@/pages/projects/ProjectsPage";
import { ProjectFormPage } from "@/pages/projects/ProjectFormPage";
import { DocumentsPage } from "@/pages/documents/Documentspage";
import { DocumentFormPage } from "@/pages/documents/Documentformpage";
import { BlogsPage } from "@/pages/blogs/BlogsPage";
import { BlogFormPage } from "@/pages/blogs/BlogFormPage";

// function PlaceholderPage({ title }: { title: string }) {
//   return (
//     <div>
//       <h1 className="text-2xl font-semibold">{title}</h1>

//       <p className="mt-2 text-sm text-muted-foreground">
//         This module is under development.
//       </p>
//     </div>
//   );
// }

export function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/change-password" element={<ChangePassword />} />
      <Route path="/test/rich-text-editor" element={<RichTextEditorTest />} />

      {/* Protected Admin Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          {/* Dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Services */}
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/create" element={<ServiceFormPage />} />
          <Route path="/services/:id/edit" element={<ServiceFormPage />} />

          {/* Projects */}
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/create" element={<ProjectFormPage />} />
          <Route path="/projects/:id/edit" element={<ProjectFormPage />} />

          {/* Clients */}
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/clients/create" element={<ClientFormPage />} />
          <Route path="/clients/:id/edit" element={<ClientFormPage />} />

          {/* Blogs */}
          <Route path="/blogs" element={<BlogsPage />} />
          <Route path="/blogs/create" element={<BlogFormPage />} />
          <Route path="/blogs/:id/edit" element={<BlogFormPage />} />

          {/* Founder */}
          <Route path="/founder" element={<FounderPage />} />
          <Route path="/founder/create" element={<FounderFormPage />} />
          <Route path="/founder/:id/edit" element={<FounderFormPage />} />

          {/* About */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/about/create" element={<AboutFormPage />} />
          <Route path="/about/edit" element={<AboutFormPage />} />

          {/* Landing Page */}
          <Route path="/landing-page" element={<LandingPageView />} />
          <Route
            path="/landing-page/create"
            element={<LandingPageFormPage />}
          />
          <Route path="/landing-page/edit" element={<LandingPageFormPage />} />

          {/* Contact */}
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/contact/create" element={<ContactFormPage />} />
          <Route path="/contact/edit" element={<ContactFormPage />} />

          {/* Documents */}
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/documents/create" element={<DocumentFormPage />} />
          <Route path="/documents/:id/edit" element={<DocumentFormPage />} />
        </Route>
      </Route>

      {/* Unknown route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
