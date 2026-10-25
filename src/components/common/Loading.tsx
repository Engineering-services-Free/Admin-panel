import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/common/PageHeader";

/* Small spinner, for buttons or inline use */
export function Spinner({ className }: { className?: string }) {
  return (
    <Loader2
      className={cn("size-4 animate-spin text-muted-foreground", className)}
      aria-hidden="true"
    />
  );
}

interface LoadingStateProps {
  message?: string;
  /** "card" = bordered box, "plain" = no border (for use inside a card) */
  variant?: "card" | "plain";
  className?: string;
}

/* Spinner with a message, for sections and lists */
export function LoadingState({
  message = "Loading...",
  variant = "card",
  className,
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-center justify-center gap-3 px-6 py-12",
        variant === "card" && "rounded-lg border",
        className,
      )}
    >
      <Spinner className="size-5" />
      <span className="text-sm text-muted-foreground">{message}</span>
    </div>
  );
}

interface PageLoadingProps {
  title: string;
  description?: string;
  message?: string;
}

/* Full page loading: header plus loading box */
export function PageLoading({
  title,
  description,
  message = "Loading...",
}: PageLoadingProps) {
  return (
    <div>
      <PageHeader title={title} description={description} />

      <LoadingState message={message} />
    </div>
  );
}
