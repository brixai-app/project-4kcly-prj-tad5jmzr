export type BrixApiClientOptions = {
  baseUrl?: string;
  fetchImpl?: typeof fetch;
  defaultHeaders?: HeadersInit;
  getAuthToken?: () => string | null | undefined | Promise<string | null | undefined>;
  onUnauthorized?: () => void;
  onError?: (error: BrixApiError) => void;
};

export type BrixApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  query?: Record<string, string | number | boolean | null | undefined>;
  parseAs?: "json" | "text" | "blob" | "arrayBuffer" | "response";
  headers?: HeadersInit;
  signal?: AbortSignal;
};

export type BrixApiClient = {
  request<T = unknown>(path: string, options?: BrixApiRequestOptions): Promise<T>;
  get<T = unknown>(path: string, options?: Omit<BrixApiRequestOptions, "method" | "body">): Promise<T>;
  post<T = unknown>(path: string, body?: unknown, options?: Omit<BrixApiRequestOptions, "method" | "body">): Promise<T>;
  put<T = unknown>(path: string, body?: unknown, options?: Omit<BrixApiRequestOptions, "method" | "body">): Promise<T>;
  patch<T = unknown>(path: string, body?: unknown, options?: Omit<BrixApiRequestOptions, "method" | "body">): Promise<T>;
  delete<T = unknown>(path: string, options?: Omit<BrixApiRequestOptions, "method" | "body">): Promise<T>;
};

export class BrixApiError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly url: string;
  readonly method: string;
  readonly code?: string;
  readonly details?: unknown;
  readonly responseBody?: unknown;
  readonly isNetworkError: boolean;
  readonly isUnauthorized: boolean;
  readonly isForbidden: boolean;
  readonly isNotFound: boolean;
  readonly isServerError: boolean;

  constructor(params: {
    message: string;
    status?: number;
    statusText?: string;
    url?: string;
    method?: string;
    code?: string;
    details?: unknown;
    responseBody?: unknown;
    cause?: unknown;
    isNetworkError?: boolean;
  }) {
    super(params.message);
    this.name = "BrixApiError";
    this.status = params.status ?? 0;
    this.statusText = params.statusText ?? "";
    this.url = params.url ?? "";
    this.method = params.method ?? "GET";
    this.code = params.code;
    this.details = params.details;
    this.responseBody = params.responseBody;
    this.isNetworkError = params.isNetworkError ?? false;
    this.isUnauthorized = this.status === 401;
    this.isForbidden = this.status === 403;
    this.isNotFound = this.status === 404;
    this.isServerError = this.status >= 500;
    if (params.cause !== undefined) {
      (this as Error & { cause?: unknown }).cause = params.cause;
    }
    Object.setPrototypeOf(this, BrixApiError.prototype);
  }

  static fromUnknown(error: unknown, context?: { url?: string; method?: string }): BrixApiError {
    if (error instanceof BrixApiError) return error;
    if (error instanceof Error) {
      return new BrixApiError({
        message: error.message || "Unexpected API error",
        url: context?.url,
        method: context?.method,
        cause: error,
        isNetworkError: true,
      });
    }
    return new BrixApiError({
      message: typeof error === "string" ? error : "Unexpected API error",
      url: context?.url,
      method: context?.method,
      details: error,
      isNetworkError: true,
    });
  }
}

function isAbsoluteUrl(path: string): boolean {
  return /^https?:\/\//i.test(path);
}

function joinUrl(baseUrl: string, path: string): string {
  if (!baseUrl) return path;
  if (isAbsoluteUrl(path)) return path;
  const normalizedBase = baseUrl.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

function buildQueryString(query?: Record<string, string | number | boolean | null | undefined>): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined) continue;
    params.append(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

function isJsonLikeBody(body: unknown): body is Record<string, unknown> | unknown[] {
  return typeof body === "object" && body !== null && !(body instanceof FormData) && !(body instanceof Blob) && !(body instanceof ArrayBuffer) && !(body instanceof URLSearchParams);
}

async function resolveHeaders(
  defaultHeaders?: HeadersInit,
  headers?: HeadersInit,
  getAuthToken?: BrixApiClientOptions["getAuthToken"]
): Promise<Headers> {
  const resolved = new Headers(defaultHeaders ?? {});
  if (getAuthToken) {
    const token = await getAuthToken();
    if (token) resolved.set("Authorization", `Bearer ${token}`);
  }
  if (headers) {
    new Headers(headers).forEach((value, key) => resolved.set(key, value));
  }
  return resolved;
}

async function parseResponse(response: Response, parseAs: NonNullable<BrixApiRequestOptions["parseAs"]>) {
  if (parseAs === "response") return response;
  if (parseAs === "blob") return response.blob();
  if (parseAs === "arrayBuffer") return response.arrayBuffer();
  if (parseAs === "text") return response.text();
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function readErrorBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") || "";
  try {
    if (contentType.includes("application/json")) return await response.json();
    const text = await response.text();
    if (!text) return undefined;
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  } catch {
    return undefined;
  }
}

export function createBrixApiClient(options: BrixApiClientOptions = {}): BrixApiClient {
  const baseUrl = options.baseUrl ?? (typeof process !== "undefined" ? process.env.NEXT_PUBLIC_API_BASE_URL ?? "" : "");
  const fetchImpl = options.fetchImpl ?? fetch;

  const request = async <T = unknown>(path: string, requestOptions: BrixApiRequestOptions = {}): Promise<T> => {
    const method = (requestOptions.method ?? "GET").toUpperCase();
    const url = `${joinUrl(baseUrl, path)}${buildQueryString(requestOptions.query)}`;
    const headers = await resolveHeaders(options.defaultHeaders, requestOptions.headers, options.getAuthToken);

    let body: BodyInit | undefined;
    if (requestOptions.body !== undefined && method !== "GET" && method !== "HEAD") {
      const rawBody = requestOptions.body;
      if (
        rawBody instanceof FormData ||
        rawBody instanceof Blob ||
        rawBody instanceof ArrayBuffer ||
        rawBody instanceof URLSearchParams ||
        typeof rawBody === "string"
      ) {
        body = rawBody;
      } else if (isJsonLikeBody(rawBody)) {
        if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
        body = JSON.stringify(rawBody);
      } else {
        body = String(rawBody);
      }
    }

    try {
      const response = await fetchImpl(url, {
        ...requestOptions,
        method,
        headers,
        body,
      });

      if (!response.ok) {
        const responseBody = await readErrorBody(response);
        const message =
          (typeof responseBody === "object" &&
            responseBody !== null &&
            ("message" in responseBody || "error" in responseBody) &&
            String((responseBody as { message?: unknown; error?: unknown }).message ?? (responseBody as { error?: unknown }).error ?? "")) ||
          `${response.status} ${response.statusText || "Request failed"}`;

        const error = new BrixApiError({
          message,
          status: response.status,
          statusText: response.statusText,
          url,
          method,
          responseBody,
          details: responseBody,
        });

        if (response.status === 401) options.onUnauthorized?.();
        options.onError?.(error);
        throw error;
      }

      const parseAs = requestOptions.parseAs ?? "json";
      return (await parseResponse(response, parseAs)) as T;
    } catch (error) {
      const normalized = BrixApiError.fromUnknown(error, { url, method });
      options.onError?.(normalized);
      throw normalized;
    }
  };

  return {
    request,
    get: <T = unknown>(path: string, requestOptions: Omit<BrixApiRequestOptions, "method" | "body"> = {}) =>
      request<T>(path, { ...requestOptions, method: "GET" }),
    post: <T = unknown>(path: string, body?: unknown, requestOptions: Omit<BrixApiRequestOptions, "method" | "body"> = {}) =>
      request<T>(path, { ...requestOptions, method: "POST", body }),
    put: <T = unknown>(path: string, body?: unknown, requestOptions: Omit<BrixApiRequestOptions, "method" | "body"> = {}) =>
      request<T>(path, { ...requestOptions, method: "PUT", body }),
    patch: <T = unknown>(path: string, body?: unknown, requestOptions: Omit<BrixApiRequestOptions, "method" | "body"> = {}) =>
      request<T>(path, { ...requestOptions, method: "PATCH", body }),
    delete: <T = unknown>(path: string, requestOptions: Omit<BrixApiRequestOptions, "method" | "body"> = {}) =>
      request<T>(path, { ...requestOptions, method: "DELETE" }),
  };
}