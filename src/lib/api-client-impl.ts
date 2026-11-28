export type BrixApiClientOptions = {
  baseUrl?: string;
  fetchImpl?: typeof fetch;
  getAuthToken?: () => string | null | undefined;
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
  readonly details: unknown;
  readonly code?: string;

  constructor(
    message: string,
    options: {
      status: number;
      statusText?: string;
      url: string;
      details?: unknown;
      code?: string;
    }
  ) {
    super(message);
    this.name = "BrixApiError";
    this.status = options.status;
    this.statusText = options.statusText ?? "";
    this.url = options.url;
    this.details = options.details;
    this.code = options.code;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  static isBrixApiError(error: unknown): error is BrixApiError {
    return error instanceof BrixApiError || (typeof error === "object" && error !== null && (error as { name?: unknown }).name === "BrixApiError");
  }
}

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === "[object Object]";
}

function buildUrl(baseUrl: string, path: string, query?: Record<string, string | number | boolean | null | undefined>): string {
  const normalizedBase = baseUrl.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${normalizedBase}${normalizedPath}`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue;
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

function mergeHeaders(...headersList: Array<HeadersInit | undefined>): Headers {
  const headers = new Headers();
  for (const item of headersList) {
    if (!item) continue;
    const current = new Headers(item);
    current.forEach((value, key) => {
      headers.set(key, value);
    });
  }
  return headers;
}

function isFormData(value: unknown): value is FormData {
  return typeof FormData !== "undefined" && value instanceof FormData;
}

function isBlob(value: unknown): value is Blob {
  return typeof Blob !== "undefined" && value instanceof Blob;
}

function isArrayBuffer(value: unknown): value is ArrayBuffer {
  return value instanceof ArrayBuffer;
}

function isURLSearchParams(value: unknown): value is URLSearchParams {
  return typeof URLSearchParams !== "undefined" && value instanceof URLSearchParams;
}

function serializeBody(body: unknown, headers: Headers): BodyInit | undefined {
  if (body === undefined) return undefined;
  if (body === null) return "null";
  if (typeof body === "string") return body;
  if (isFormData(body) || isBlob(body) || isArrayBuffer(body) || isURLSearchParams(body)) return body;
  if (body instanceof ReadableStream) return body;
  if (body instanceof URL) return body.toString();

  if (isPlainObject(body) || Array.isArray(body)) {
    if (!headers.has("content-type")) headers.set("content-type", "application/json");
    return JSON.stringify(body as JsonValue);
  }

  if (typeof body === "number" || typeof body === "boolean") {
    if (!headers.has("content-type")) headers.set("content-type", "application/json");
    return JSON.stringify(body);
  }

  return String(body);
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
  if (response.status === 204 || response.status === 205) return null;

  if (contentType.includes("application/json") || contentType.includes("+json")) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  try {
    const text = await response.text();
    return text.length ? text : null;
  } catch {
    return null;
  }
}

function extractErrorMessage(details: unknown, fallback: string): string {
  if (typeof details === "string" && details.trim()) return details;
  if (isPlainObject(details)) {
    const candidates = [
      details.message,
      details.error,
      details.detail,
      details.title,
      details.description,
    ];
    for (const candidate of candidates) {
      if (typeof candidate === "string" && candidate.trim()) return candidate;
    }
  }
  return fallback;
}

async function handleResponse<T>(response: Response): Promise<T> {
  const details = await parseResponseBody(response);

  if (!response.ok) {
    const message = extractErrorMessage(
      details,
      `Request failed with status ${response.status}${response.statusText ? ` ${response.statusText}` : ""}`
    );
    const code =
      isPlainObject(details) && typeof details.code === "string"
        ? details.code
        : isPlainObject(details) && typeof details.errorCode === "string"
          ? details.errorCode
          : undefined;

    throw new BrixApiError(message, {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      details,
      code,
    });
  }

  return details as T;
}

export function createBrixApiClient(options: BrixApiClientOptions = {}) {
  const baseUrl = options.baseUrl ?? (typeof window !== "undefined" && window.location ? window.location.origin : "");
  const fetchImpl = options.fetchImpl ?? globalThis.fetch?.bind(globalThis);
  if (!fetchImpl) {
    throw new Error("No fetch implementation available. Provide fetchImpl in createBrixApiClient options.");
  }

  const request = async <T = unknown>(path: string, requestOptions: BrixApiRequestOptions = {}): Promise<T> => {
    const url = buildUrl(baseUrl, path, requestOptions.query);
    const headers = mergeHeaders(options.defaultHeaders, requestOptions.headers);

    const token = options.getAuthToken?.();
    if (token && !headers.has("authorization")) {
      headers.set("authorization", token.startsWith("Bearer ") ? token : `Bearer ${token}`);
    }

    const body = serializeBody(requestOptions.body, headers);

    const response = await fetchImpl(url, {
      ...requestOptions,
      headers,
      body,
    });

    if (response.status === 401) {
      options.onUnauthorized?.();
    }

    return handleResponse<T>(response);
  };

  const client = {
    request,
    get: <T = unknown>(path: string, requestOptions: Omit<BrixApiRequestOptions, "body" | "method"> = {}) =>
      request<T>(path, { ...requestOptions, method: "GET" }),
    post: <T = unknown>(path: string, body?: unknown, requestOptions: Omit<BrixApiRequestOptions, "body" | "method"> = {}) =>
      request<T>(path, { ...requestOptions, method: "POST", body }),
    put: <T = unknown>(path: string, body?: unknown, requestOptions: Omit<BrixApiRequestOptions, "body" | "method"> = {}) =>
      request<T>(path, { ...requestOptions, method: "PUT", body }),
    patch: <T = unknown>(path: string, body?: unknown, requestOptions: Omit<BrixApiRequestOptions, "body" | "method"> = {}) =>
      request<T>(path, { ...requestOptions, method: "PATCH", body }),
    delete: <T = unknown>(path: string, requestOptions: Omit<BrixApiRequestOptions, "body" | "method"> = {}) =>
      request<T>(path, { ...requestOptions, method: "DELETE" }),
    head: async (path: string, requestOptions: Omit<BrixApiRequestOptions, "body" | "method"> = {}) => {
      const url = buildUrl(baseUrl, path, requestOptions.query);
      const headers = mergeHeaders(options.defaultHeaders, requestOptions.headers);

      const token = options.getAuthToken?.();
      if (token && !headers.has("authorization")) {
        headers.set("authorization", token.startsWith("Bearer ") ? token : `Bearer ${token}`);
      }

      const response = await fetchImpl(url, {
        ...requestOptions,
        method: "HEAD",
        headers,
      });

      if (response.status === 401) {
        options.onUnauthorized?.();
      }

      if (!response.ok) {
        const details = await parseResponseBody(response);
        const message = extractErrorMessage(
          details,
          `Request failed with status ${response.status}${response.statusText ? ` ${response.statusText}` : ""}`
        );
        throw new BrixApiError(message, {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          details,
        });
      }

      return response;
    },
    withBaseUrl: (nextBaseUrl: string) => createBrixApiClient({ ...options, baseUrl: nextBaseUrl }),
    withAuthToken: (getAuthToken: () => string | null | undefined) =>
      createBrixApiClient({ ...options, getAuthToken }),
  };

  return client;
}

export type BrixApiClient = ReturnType<typeof createBrixApiClient>;