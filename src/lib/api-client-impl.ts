export type BrixApiClientOptions = {
  baseUrl?: string;
  fetchImpl?: typeof fetch;
  defaultHeaders?: HeadersInit;
  onUnauthorized?: () => void;
};

export type BrixApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  query?: Record<string, string | number | boolean | null | undefined>;
  parseAs?: "json" | "text" | "blob" | "arrayBuffer" | "response";
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

const isAbsoluteUrl = (value: string) => /^https?:\/\//i.test(value);

const joinUrl = (baseUrl: string, path: string) => {
  if (!baseUrl) return path;
  if (isAbsoluteUrl(path)) return path;
  const normalizedBase = baseUrl.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
};

const buildQueryString = (query?: BrixApiRequestOptions["query"]) => {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
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

const normalizeBody = (body: unknown): BodyInit | undefined => {
  if (body === undefined || body === null) return undefined;
  if (
    typeof body === "string" ||
    isFormData(body) ||
    isBlob(body) ||
    isArrayBuffer(body) ||
    isURLSearchParams(body)
  ) {
    return body as BodyInit;
  }
  if (body instanceof ReadableStream) return body as unknown as BodyInit;
  return JSON.stringify(body);
};

const parseResponse = async (response: Response, parseAs: NonNullable<BrixApiRequestOptions["parseAs"]>) => {
  switch (parseAs) {
    case "response":
      return response;
    case "text":
      return response.text();
    case "blob":
      return response.blob();
    case "arrayBuffer":
      return response.arrayBuffer();
    case "json":
    default: {
      const contentType = response.headers.get("content-type") ?? "";
      if (response.status === 204 || response.status === 205) return null;
      if (contentType.includes("application/json") || contentType.includes("+json")) {
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
  }
};

const extractErrorDetails = async (response: Response) => {
  const contentType = response.headers.get("content-type") ?? "";
  try {
    if (contentType.includes("application/json") || contentType.includes("+json")) {
      return await response.json();
    }
    const text = await response.text();
    return text || undefined;
  } catch {
    return undefined;
  }
};

export function createBrixApiClient(options: BrixApiClientOptions = {}) {
  const baseUrl = options.baseUrl ?? "";
  const fetchImpl = options.fetchImpl ?? fetch.bind(globalThis);

  const request = async <T = unknown>(
    path: string,
    requestOptions: BrixApiRequestOptions = {}
  ): Promise<T> => {
    const url = `${joinUrl(baseUrl, path)}${buildQueryString(requestOptions.query)}`;
    const headers = new Headers(options.defaultHeaders ?? {});
    const inputHeaders = new Headers(requestOptions.headers ?? {});
    inputHeaders.forEach((value, key) => headers.set(key, value));

    const method = (requestOptions.method ?? "GET").toUpperCase();
    const body = normalizeBody(requestOptions.body);

    if (body !== undefined && !headers.has("content-type") && !(body instanceof FormData)) {
      headers.set("content-type", "application/json");
    }

    const response = await fetchImpl(url, {
      ...requestOptions,
      method,
      headers,
      body,
    });

    if (!response.ok) {
      const details = await extractErrorDetails(response);
      const message =
        (typeof details === "object" && details && "message" in details && typeof (details as { message?: unknown }).message === "string"
          ? (details as { message: string }).message
          : `${response.status} ${response.statusText}`) || "Request failed";

      if (response.status === 401) options.onUnauthorized?.();

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

    const parseAs = requestOptions.parseAs ?? "json";
    return (await parseResponse(response, parseAs)) as T;
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