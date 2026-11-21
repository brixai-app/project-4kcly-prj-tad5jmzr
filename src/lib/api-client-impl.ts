export type BrixApiClientOptions = {
  baseUrl?: string;
  fetchImpl?: typeof fetch;
  defaultHeaders?: HeadersInit;
  onUnauthorized?: () => void;
};

export type BrixApiRequestOptions = Omit<RequestInit, "body" | "headers"> & {
  headers?: HeadersInit;
  query?: Record<string, string | number | boolean | null | undefined>;
  body?: unknown;
  responseType?: "json" | "text" | "blob" | "arrayBuffer" | "response";
};

export class BrixApiError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly url: string;
  readonly method: string;
  readonly payload: unknown;

  constructor(params: {
    message: string;
    status: number;
    statusText: string;
    url: string;
    method: string;
    payload?: unknown;
  }) {
    super(params.message);
    this.name = "BrixApiError";
    this.status = params.status;
    this.statusText = params.statusText;
    this.url = params.url;
    this.method = params.method;
    this.payload = params.payload;
    Object.setPrototypeOf(this, BrixApiError.prototype);
  }

  static is(value: unknown): value is BrixApiError {
    return value instanceof BrixApiError;
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

const isFormData = (value: unknown): value is FormData =>
  typeof FormData !== "undefined" && value instanceof FormData;

const isBlob = (value: unknown): value is Blob =>
  typeof Blob !== "undefined" && value instanceof Blob;

const isArrayBuffer = (value: unknown): value is ArrayBuffer =>
  typeof ArrayBuffer !== "undefined" && value instanceof ArrayBuffer;

const isURLSearchParams = (value: unknown): value is URLSearchParams =>
  typeof URLSearchParams !== "undefined" && value instanceof URLSearchParams;

const normalizeHeaders = (headers?: HeadersInit) => {
  const result = new Headers();
  if (!headers) return result;
  new Headers(headers).forEach((value, key) => result.set(key, value));
  return result;
};

const serializeBody = (body: unknown, headers: Headers) => {
  if (body === undefined) return undefined;
  if (body === null) return "null";
  if (
    typeof body === "string" ||
    isFormData(body) ||
    isBlob(body) ||
    isArrayBuffer(body) ||
    isURLSearchParams(body)
  ) {
    return body as BodyInit;
  }
  if (body instanceof URLSearchParams) return body;
  if (typeof body === "object") {
    if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    return JSON.stringify(body);
  }
  if (!headers.has("Content-Type")) headers.set("Content-Type", "text/plain;charset=UTF-8");
  return String(body);
};

const parseResponse = async <T,>(response: Response, responseType: NonNullable<BrixApiRequestOptions["responseType"]>) => {
  if (responseType === "response") return response as unknown as T;
  if (responseType === "text") return (await response.text()) as unknown as T;
  if (responseType === "blob") return (await response.blob()) as unknown as T;
  if (responseType === "arrayBuffer") return (await response.arrayBuffer()) as unknown as T;
  if (response.status === 204) return undefined as T;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return (await response.json()) as T;
  const text = await response.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
};

export function createBrixApiClient(options: BrixApiClientOptions = {}): ApiClient {
  const baseUrl = options.baseUrl ?? (typeof window !== "undefined" ? window.location.origin : "");
  const fetchImpl = options.fetchImpl ?? fetch.bind(globalThis);

  const request = async <T = unknown>(path: string, reqOptions: BrixApiRequestOptions = {}): Promise<T> => {
    const method = (reqOptions.method ?? "GET").toUpperCase();
    const url = `${joinUrl(baseUrl, path)}${buildQueryString(reqOptions.query)}`;
    const headers = normalizeHeaders(options.defaultHeaders);
    normalizeHeaders(reqOptions.headers).forEach((value, key) => headers.set(key, value));

    const body = serializeBody(reqOptions.body, headers);

    const response = await fetchImpl(url, {
      ...reqOptions,
      method,
      headers,
      body: body as BodyInit | null | undefined,
    });

    if (!response.ok) {
      let payload: unknown = undefined;
      const contentType = response.headers.get("content-type") || "";
      try {
        payload = contentType.includes("application/json") ? await response.json() : await response.text();
      } catch {
        payload = undefined;
      }

      if (response.status === 401) options.onUnauthorized?.();

      throw new BrixApiError({
        message: payload && typeof payload === "object" && "message" in (payload as Record<string, unknown>)
          ? String((payload as Record<string, unknown>).message)
          : `Request failed with status ${response.status}`,
        status: response.status,
        statusText: response.statusText,
        url,
        method,
        payload,
      });
    }

    return parseResponse<T>(response, reqOptions.responseType ?? "json");
  };

  return {
    request,
    get: <T = unknown>(path: string, reqOptions: Omit<BrixApiRequestOptions, "body" | "method"> = {}) =>
      request<T>(path, { ...reqOptions, method: "GET" }),
    post: <T = unknown>(path: string, body?: unknown, reqOptions: Omit<BrixApiRequestOptions, "body" | "method"> = {}) =>
      request<T>(path, { ...reqOptions, method: "POST", body }),
    put: <T = unknown>(path: string, body?: unknown, reqOptions: Omit<BrixApiRequestOptions, "body" | "method"> = {}) =>
      request<T>(path, { ...reqOptions, method: "PUT", body }),
    patch: <T = unknown>(path: string, body?: unknown, reqOptions: Omit<BrixApiRequestOptions, "body" | "method"> = {}) =>
      request<T>(path, { ...reqOptions, method: "PATCH", body }),
    delete: <T = unknown>(path: string, reqOptions: Omit<BrixApiRequestOptions, "body" | "method"> = {}) =>
      request<T>(path, { ...reqOptions, method: "DELETE" }),
  };
}