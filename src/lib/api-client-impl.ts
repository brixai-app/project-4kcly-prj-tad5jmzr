export type BrixApiClientOptions = {
  baseUrl?: string;
  getAuthToken?: () => string | Promise<string | null | undefined>;
  defaultHeaders?: HeadersInit;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
};

export type BrixApiRequestOptions = Omit<RequestInit, "body" | "headers"> & {
  headers?: HeadersInit;
  body?: unknown;
  query?: Record<string, string | number | boolean | null | undefined>;
  timeoutMs?: number;
  parseAs?: "json" | "text" | "blob" | "arrayBuffer" | "response";
};

export class BrixApiError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly url: string;
  readonly method: string;
  readonly code?: string;
  readonly details?: unknown;
  readonly responseBody?: unknown;

  constructor(params: {
    message: string;
    status: number;
    statusText: string;
    url: string;
    method: string;
    code?: string;
    details?: unknown;
    responseBody?: unknown;
  }) {
    super(params.message);
    this.name = "BrixApiError";
    this.status = params.status;
    this.statusText = params.statusText;
    this.url = params.url;
    this.method = params.method;
    this.code = params.code;
    this.details = params.details;
    this.responseBody = params.responseBody;
    Object.setPrototypeOf(this, BrixApiError.prototype);
  }
}

type BrixApiClient = {
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
  const base = baseUrl.replace(/\/+$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
};

const toQueryString = (query?: BrixApiRequestOptions["query"]) => {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined) continue;
    params.append(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
};

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (Object.prototype.toString.call(value) !== "[object Object]") return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
};

const normalizeHeaders = (headers?: HeadersInit) => {
  const result = new Headers();
  if (!headers) return result;
  if (headers instanceof Headers) {
    headers.forEach((value, key) => result.set(key, value));
    return result;
  }
  if (Array.isArray(headers)) {
    for (const [key, value] of headers) result.set(key, value);
    return result;
  }
  for (const [key, value] of Object.entries(headers)) {
    if (value !== undefined) result.set(key, String(value));
  }
  return result;
};

const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number, onTimeout: () => void): Promise<T> => {
  if (!timeoutMs || timeoutMs <= 0) return promise;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      onTimeout();
      reject(new Error(`Request timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};

const safeParseJson = async (response: Response) => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
};

const buildError = async (response: Response, url: string, method: string): Promise<BrixApiError> => {
  const responseBody = await safeParseJson(response);
  const message =
    (isPlainObject(responseBody) && typeof responseBody.message === "string" && responseBody.message) ||
    response.statusText ||
    `Request failed with status ${response.status}`;

  const code =
    isPlainObject(responseBody) && typeof responseBody.code === "string" ? responseBody.code : undefined;

  return new BrixApiError({
    message,
    status: response.status,
    statusText: response.statusText,
    url,
    method,
    code,
    details: responseBody,
    responseBody,
  });
};

export const createBrixApiClient = (options: BrixApiClientOptions = {}): BrixApiClient => {
  const baseUrl = options.baseUrl ?? (typeof window !== "undefined" ? "/api" : "");
  const fetchImpl = options.fetchImpl ?? fetch.bind(globalThis);
  const defaultHeaders = normalizeHeaders(options.defaultHeaders);
  const defaultTimeoutMs = options.timeoutMs ?? 30000;

  const request = async <T = unknown>(path: string, requestOptions: BrixApiRequestOptions = {}): Promise<T> => {
    const method = (requestOptions.method ?? "GET").toUpperCase();
    const url = joinUrl(baseUrl, path) + toQueryString(requestOptions.query);
    const headers = normalizeHeaders(defaultHeaders);

    const authToken = options.getAuthToken ? await options.getAuthToken() : null;
    if (authToken) headers.set("Authorization", `Bearer ${authToken}`);

    const incomingHeaders = normalizeHeaders(requestOptions.headers);
    incomingHeaders.forEach((value, key) => headers.set(key, value));

    let body: BodyInit | undefined;
    const rawBody = requestOptions.body;

    if (rawBody !== undefined && rawBody !== null && method !== "GET" && method !== "HEAD") {
      if (
        typeof rawBody === "string" ||
        rawBody instanceof FormData ||
        rawBody instanceof Blob ||
        rawBody instanceof ArrayBuffer ||
        rawBody instanceof URLSearchParams ||
        rawBody instanceof ReadableStream
      ) {
        body = rawBody as BodyInit;
      } else if (isPlainObject(rawBody) || Array.isArray(rawBody)) {
        if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
        body = JSON.stringify(rawBody);
      } else {
        body = String(rawBody);
      }
    }

    const controller = typeof AbortController !== "undefined" ? new AbortController() : undefined;
    const timeoutMs = requestOptions.timeoutMs ?? defaultTimeoutMs;
    const signal = requestOptions.signal ?? controller?.signal;

    const response = await withTimeout(
      fetchImpl(url, {
        ...requestOptions,
        method,
        headers,
        body,
        signal,
      }),
      timeoutMs,
      () => controller?.abort()
    );

    if (!response.ok) {
      throw await buildError(response, url, method);
    }

    const parseAs = requestOptions.parseAs ?? "json";
    if (parseAs === "response") return response as unknown as T;
    if (parseAs === "text") return (await response.text()) as unknown as T;
    if (parseAs === "blob") return (await response.blob()) as unknown as T;
    if (parseAs === "arrayBuffer") return (await response.arrayBuffer()) as unknown as T;

    const contentType = response.headers.get("content-type") ?? "";
    if (response.status === 204 || response.status === 205) return undefined as T;
    if (contentType.includes("application/json")) return (await response.json()) as T;

    const text = await response.text();
    try {
      return JSON.parse(text) as T;
    } catch {
      return text as unknown as T;
    }
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
};