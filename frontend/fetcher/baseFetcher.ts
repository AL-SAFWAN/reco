export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export class ApiError extends Error {
  status: number;
  detail: unknown;

  constructor(message: string, status: number, detail: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

export async function fetchWithErrorHandling(
  url: string,
  options: RequestInit = {},
) {
  const response = await fetch(url, options);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const detail = errorData?.detail ?? null;
    const errorMessage =
      typeof detail === "string"
        ? detail
        : detail?.message || errorData?.message || "An error occurred";
    throw new ApiError(errorMessage, response.status, detail);
  }

  const data = response.status === 204 || response.headers.get("content-length") === "0"
    ? null
    : await response.json();
  return data;
}
