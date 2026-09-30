import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";

import { useAbout } from "@/hooks/services/useAbout";
import { sanitizeRichText } from "@/lib/sanitizeRichText";

// Styles for the rendered rich text. These work without the typography plugin.
const RICH_TEXT_CLASSES = [
  "text-sm leading-relaxed break-words",
  "[&_h1]:mb-3 [&_h1]:mt-6 [&_h1]:text-2xl [&_h1]:font-semibold",
  "[&_h2]:mb-3 [&_h2]:mt-5 [&_h2]:text-xl [&_h2]:font-semibold",
  "[&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-lg [&_h3]:font-semibold",
  "[&_p]:mb-4",
  "[&_a]:text-primary [&_a]:underline",
  "[&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6",
  "[&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6",
  "[&_blockquote]:border-l-4 [&_blockquote]:pl-4 [&_blockquote]:italic",
  "[&_img]:my-4 [&_img]:max-w-full [&_img]:rounded-md",
  "[&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
].join(" ");

export function AboutPage() {
  const navigate = useNavigate();
  const aboutQuery = useAbout();

  const about = aboutQuery.data?.data;

  const isNotFound =
    aboutQuery.isError &&
    axios.isAxiosError(aboutQuery.error) &&
    aboutQuery.error.response?.status === 404;

  // Sanitize the stored HTML. Inline styles are removed so pasted colors
  // (like white text) don't become invisible in light mode.
  const safeAboutUs = useMemo(
    () => sanitizeRichText(about?.aboutUs ?? ""),
    [about?.aboutUs],
  );

  // Loading
  if (aboutQuery.isLoading) {
    return (
      <div>
        <PageHeader title="About" description="Loading About information..." />

        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Real error (not a 404)
  if (aboutQuery.isError && !isNotFound) {
    return (
      <div>
        <PageHeader
          title="About"
          description="Manage your company About information."
        />

        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6">
          <p className="text-sm text-destructive">
            {aboutQuery.error instanceof Error
              ? aboutQuery.error.message
              : "Failed to load About information."}
          </p>
        </div>
      </div>
    );
  }

  // Empty state: 404 or no data
  if (isNotFound || !about) {
    return (
      <div>
        <PageHeader
          title="About"
          description="Manage your company About information."
        />

        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed px-6 py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <Info className="size-6 text-muted-foreground" />
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-semibold">No About information yet</h2>
            <p className="text-sm text-muted-foreground">
              You haven't added any About information for your website.
            </p>
          </div>

          <Button type="button" onClick={() => navigate("/about/create")}>
            Create About
          </Button>
        </div>
      </div>
    );
  }

  // About exists: show it
  return (
    <div>
      <PageHeader
        title="About"
        description="Your company About information."
        actions={
          <Button type="button" onClick={() => navigate("/about/edit")}>
            Edit About
          </Button>
        }
      />

      <div className="space-y-6">
        {/* Hero Image */}
        <section className="rounded-lg border">
          <div className="border-b p-6">
            <h2 className="text-lg font-semibold">Hero Image</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Main image for the About page.
            </p>
          </div>

          <div className="p-6">
            {about.heroImage?.url ? (
              <div className="overflow-hidden rounded-lg border">
                <img
                  src={about.heroImage.url}
                  alt={about.heroImage.alt || "About hero image"}
                  className="h-72 w-full object-cover"
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No hero image uploaded.
              </p>
            )}
          </div>
        </section>

        {/* Overview */}
        <section className="rounded-lg border">
          <div className="border-b p-6">
            <h2 className="text-lg font-semibold">Overview</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Short overview of your company.
            </p>
          </div>

          <div className="p-6">
            {about.overview ? (
              <p className="whitespace-pre-line text-sm leading-relaxed">
                {about.overview}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                No overview added.
              </p>
            )}
          </div>
        </section>

        {/* About Us */}
        <section className="rounded-lg border">
          <div className="border-b p-6">
            <h2 className="text-lg font-semibold">About Us</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Detailed information about the company.
            </p>
          </div>

          <div className="p-6">
            {safeAboutUs ? (
              <div
                className={RICH_TEXT_CLASSES}
                dangerouslySetInnerHTML={{ __html: safeAboutUs }}
              />
            ) : (
              <p className="text-sm text-muted-foreground">No details added.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
