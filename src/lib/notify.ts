import { toast } from "sonner";

import { getErrorMessage } from "@/lib/getErrorMessage";

export function notifyError(
  error: unknown,
  fallback = "Something went wrong.",
) {
  const message = getErrorMessage(error, fallback);

  // Using the message as the id stops identical toasts from stacking
  toast.error(message, { id: message });
}

export function notifySuccess(message: string) {
  toast.success(message);
}
