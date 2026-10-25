import axios from "axios";

interface ApiErrorBody {
  message?: string;
  error?: {
    message?: string;
    details?: { field?: string; message?: string }[];
  };
}

export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong.",
) {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    if (!error.response) {
      return "Network error. Check your connection.";
    }

    const body = error.response.data;
    const detail = body?.error?.details?.[0];

    if (detail?.message) {
      return detail.field
        ? `${detail.field}: ${detail.message}`
        : detail.message;
    }

    return body?.error?.message ?? body?.message ?? fallback;
  }

  return error instanceof Error ? error.message : fallback;
}
