export type BrixApiClientOptions = {
  baseUrl?: string;
  fetchImpl?: typeof fetch;
  getAuthToken?: () => string | null | Promise<string | null>;
  onUnauthorized?: () => void;
  defaultHeaders?: HeadersInit;
};

export type BrixApiRequestOptions = Omit<RequestInit, "body" | "headers"> & {
  headers?: HeadersInit;
  body?: unknown;
  query?: Record<string, string | number | boolean | null | undefined>;
  signal?: AbortSignal;
};

export class BrixApiError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly url: string;
  readonly method: string;
  readonly details: unknown;
  readonly response?: Response;

  constructor(params: {
    message: string;
    status: number;
    statusText: string;
    url: string;
    method: string;
    details?: unknown;
    response?: Response;
  }) {
    super(params.message);
    this.name = "BrixApiError";
    this.status = params.status;
    this.statusText = params.statusText;
    this.url = params.url;
    this.method = params.method;
    this.details = params.details;
    this.response = params.response;
    Object.setPrototypeOf(this, BrixApiError.prototype);
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  get isForbidden() {
    return this.status === 403;
  }

  get isNotFound() {
    return this.status === 404;
  }

  get isServerError() {
    return this.status >= 500;
  }
}

type ApiClient = {
  request<T = unknown>(path: string, options?: BrixApiRequestOptions): Promise<T>;
  get<T = unknown>(path: string, options?: Omit<BrixApiRequestOptions, "body" | "method">): Promise<T>;
  post<T = unknown>(path: string, body?: unknown, options?: Omit<BrixApiRequestOptions, "body" | "method">): Promise<T>;
  put<T = unknown>(path: string, body?: unknown, options?: Omit<BrixApiRequestOptions, "body" | "method">): Promise<T>;
  patch<T = unknown>(path: string, body?: unknown, options?: Omit<BrixApiRequestOptions, "body" | "method">): Promise<T>;
  delete<T = unknown>(path: string, options?: Omit<BrixApiRequestOptions, "body" | "method">): Promise<T>;
};

const isAbsoluteUrl = (value: string) => /^https?:\/\//i.test(value);

const joinUrl = (baseUrl: string, path: string) => {
  if (isAbsoluteUrl(path)) return path;
  const normalizedBase = baseUrl.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
};

const buildQueryString = (query?: BrixApiRequestOptions["query"]) => {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined) continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
};

const isJsonLike = (value: unknown) => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return false;
  if (value instanceof FormData) return false;
  if (value instanceof Blob) return false;
  if (value instanceof ArrayBuffer) return false;
  if (ArrayBuffer.isView(value)) return false;
  if (value instanceof URLSearchParams) return false;
  return typeof value === "object";
};

const safeParseJson = async (response: Response) => {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    const text = await response.text().catch(() => "");
    return text || null;
  }
  try {
    return await response.json();
  } catch {
    const text = await response.text().catch(() => "");
    return text || null;
  }
};

const normalizeHeaders = async (
  headers: HeadersInit | undefined,
  body: unknown,
  token: string | null,
  defaultHeaders?: HeadersInit
) => {
  const merged = new Headers(defaultHeaders);
  if (headers) new Headers(headers).forEach((value, key) => merged.set(key, value));
  if (token) merged.set("Authorization", `Bearer ${token}`);

  if (isJsonLike(body) && !merged.has("Content-Type")) {
    merged.set("Content-Type", "application/json");
  }

  return merged;
};

const createErrorFromResponse = async (
  response: Response,
  url: string,
  method: string
): Promise<BrixApiError> => {
  const details = await safeParseJson(response).catch(() => null);
  const message =
    (details && typeof details === "object" && "message" in details && typeof (details as { message?: unknown }).message === "string"
      ? (details as { message: string }).message
      : response.statusText) || `Request failed with status ${response.status}`;
  return new BrixApiError({
    message,
    status: response.status,
    statusText: response.statusText,
    url,
    method,
    details,
    response,
  });
};

export function createBrixApiClient(options: BrixApiClientOptions = {}): ApiClient {
  const baseUrl = options.baseUrl ?? (typeof process !== "undefined" ? process.env.NEXT_PUBLIC_API_BASE_URL || "" : "");
  const fetchImpl = options.fetchImpl ?? fetch;

  const request = async <T = unknown>(path: string, requestOptions: BrixApiRequestOptions = {}): Promise<T> => {
    const method = (requestOptions.method ?? "GET").toUpperCase();
    const url = `${joinUrl(baseUrl, path)}${buildQueryString(requestOptions.query)}`;

    const token = options.getAuthToken ? await options.getAuthToken() : null;
    const headers = await normalizeHeaders(requestOptions.headers, requestOptions.body, token, options.defaultHeaders);

    const init: RequestInit = {
      ...requestOptions,
      method,
      headers,
      signal: requestOptions.signal,
    };

    if (requestOptions.body !== undefined) {
      if (headers.get("Content-Type")?.includes("application/json") && isJsonLike(requestOptions.body)) {
        init.body = JSON.stringify(requestOptions.body);
      } else if (
        requestOptions.body instanceof FormData ||
        requestOptions.body instanceof Blob ||
        requestOptions.body instanceof ArrayBuffer ||
        ArrayBuffer.isView(requestOptions.body) ||
        requestOptions.body instanceof URLSearchParams ||
        typeof requestOptions.body === "string"
      ) {
        init.body = requestOptions.body as BodyInit;
      } else {
        init.body = JSON.stringify(requestOptions.body);
      }
    }

    const response = await fetchImpl(url, init);

    if (!response.ok) {
      if (response.status === 401 && options.onUnauthorized) {
        try {
          options.onUnauthorized();
        } catch {
          // ignore callback errors
        }
      }
      throw await createErrorFromResponse(response, url, method);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const contentType = response.headers.get("content-type") || "";
    if (contentType.toLowerCase().includes("application/json")) {
      return (await response.json()) as T;
    }

    const text = await response.text();
    return text as T;
  };

  return {
    request,
    get: <T = unknown>(path: string, options?: Omit<BrixApiRequestOptions, "body" | "method">) =>
      request<T>(path, { ...options, method: "GET" }),
    post: <T = unknown>(path: string, body?: unknown, options?: Omit<BrixApiRequestOptions, "body" | "method">) =>
      request<T>(path, { ...options, method: "POST", body }),
    put: <T = unknown>(path: string, body?: unknown, options?: Omit<BrixApiRequestOptions, "body" | "method">) =>
      request<T>(path, { ...options, method: "PUT", body }),
    patch: <T = unknown>(path: string, body?: unknown, options?: Omit<BrixApiRequestOptions, "body" | "method">) =>
      request<T>(path, { ...options, method: "PATCH", body }),
    delete: <T = unknown>(path: string, options?: Omit<BrixApiRequestOptions, "body" | "method">) =>
      request<T>(path, { ...options, method: "DELETE" }),
  };
}