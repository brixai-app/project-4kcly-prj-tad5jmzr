export type BrixApiClientOptions = {
  baseUrl?: string;
  fetchImpl?: typeof fetch;
  getAuthToken?: () => string | null | undefined | Promise<string | null | undefined>;
  onUnauthorized?: () => void;
  defaultHeaders?: HeadersInit;
};

export type BrixApiRequestOptions = Omit<RequestInit, "body" | "headers"> & {
  headers?: HeadersInit;
  query?: Record<string, string | number | boolean | null | undefined>;
  body?: unknown;
  rawBody?: BodyInit | null;
  responseType?: "json" | "text" | "blob" | "arrayBuffer" | "response";
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
  }
}

type ApiClient = {
  request<T = unknown>(path: string, options?: BrixApiRequestOptions): Promise<T>;
  get<T = unknown>(path: string, options?: Omit<BrixApiRequestOptions, "body" | "rawBody" | "method">): Promise<T>;
  post<T = unknown>(path: string, body?: unknown, options?: Omit<BrixApiRequestOptions, "body" | "rawBody" | "method">): Promise<T>;
  put<T = unknown>(path: string, body?: unknown, options?: Omit<BrixApiRequestOptions, "body" | "rawBody" | "method">): Promise<T>;
  patch<T = unknown>(path: string, body?: unknown, options?: Omit<BrixApiRequestOptions, "body" | "rawBody" | "method">): Promise<T>;
  del<T = unknown>(path: string, options?: Omit<BrixApiRequestOptions, "body" | "rawBody" | "method">): Promise<T>;
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

const isJsonLike = (value: unknown) => {
  if (value === null) return true;
  if (Array.isArray(value)) return true;
  const t = typeof value;
  return t === "object" || t === "string" || t === "number" || t === "boolean";
};

const normalizeHeaders = (headers?: HeadersInit) => {
  const result = new Headers(headers);
  return result;
};

const safeParseJson = async (response: Response) => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

export function createBrixApiClient(options: BrixApiClientOptions = {}): ApiClient {
  const baseUrl = options.baseUrl ?? (typeof window !== "undefined" ? "" : "http://localhost:3000");
  const fetchImpl = options.fetchImpl ?? fetch.bind(globalThis);
  const defaultHeaders = normalizeHeaders(options.defaultHeaders);

  const request = async <T = unknown>(path: string, requestOptions: BrixApiRequestOptions = {}): Promise<T> => {
    const method = (requestOptions.method ?? "GET").toUpperCase();
    const url = `${joinUrl(baseUrl, path)}${toQueryString(requestOptions.query)}`;

    const headers = normalizeHeaders(defaultHeaders);
    if (requestOptions.headers) {
      new Headers(requestOptions.headers).forEach((value, key) => headers.set(key, value));
    }

    const token = await options.getAuthToken?.();
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    let body: BodyInit | undefined;
    if (requestOptions.rawBody !== undefined) {
      body = requestOptions.rawBody ?? undefined;
    } else if (requestOptions.body !== undefined) {
      if (requestOptions.body instanceof FormData || requestOptions.body instanceof Blob || requestOptions.body instanceof ArrayBuffer || requestOptions.body instanceof URLSearchParams) {
        body = requestOptions.body as BodyInit;
      } else if (typeof requestOptions.body === "string") {
        body = requestOptions.body;
        if (!headers.has("Content-Type")) headers.set("Content-Type", "text/plain;charset=UTF-8");
      } else if (isJsonLike(requestOptions.body)) {
        body = JSON.stringify(requestOptions.body);
        if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
      } else {
        body = String(requestOptions.body);
        if (!headers.has("Content-Type")) headers.set("Content-Type", "text/plain;charset=UTF-8");
      }
    }

    const response = await fetchImpl(url, {
      ...requestOptions,
      method,
      headers,
      body,
    });

    if (!response.ok) {
      const details = await safeParseJson(response.clone());
      const message =
        (details && typeof details === "object" && "message" in details && typeof (details as { message?: unknown }).message === "string"
          ? (details as { message: string }).message
          : `${method} ${path} failed with ${response.status} ${response.statusText}`) || "Request failed";

      if (response.status === 401) {
        options.onUnauthorized?.();
      }

      throw new BrixApiError({
        message,
        status: response.status,
        statusText: response.statusText,
        url,
        method,
        details,
        response,
      });
    }

    const responseType = requestOptions.responseType ?? "json";
    if (responseType === "response") return response as unknown as T;
    if (responseType === "text") return (await response.text()) as unknown as T;
    if (responseType === "blob") return (await response.blob()) as unknown as T;
    if (responseType === "arrayBuffer") return (await response.arrayBuffer()) as unknown as T;

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

  const client: ApiClient = {
    request,
    get: (path, options) => request(path, { ...options, method: "GET" }),
    post: (path, body, options) => request(path, { ...options, method: "POST", body }),
    put: (path, body, options) => request(path, { ...options, method: "PUT", body }),
    patch: (path, body, options) => request(path, { ...options, method: "PATCH", body }),
    del: (path, options) => request(path, { ...options, method: "DELETE" }),
  };

  return client;
}