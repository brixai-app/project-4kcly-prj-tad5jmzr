export type BrixApiClientOptions = {
  baseUrl?: string;
  fetchImpl?: typeof fetch;
  getAuthToken?: () => string | null | undefined;
  onUnauthorized?: () => void;
  defaultHeaders?: HeadersInit;
};

export type BrixApiRequestOptions = Omit<RequestInit, 'body' | 'headers'> & {
  headers?: HeadersInit;
  body?: unknown;
  query?: Record<string, string | number | boolean | null | undefined>;
  signal?: AbortSignal;
};

export class BrixApiError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly url: string;
  readonly code?: string;
  readonly details?: unknown;
  readonly responseBody?: unknown;

  constructor(params: {
    message: string;
    status: number;
    statusText: string;
    url: string;
    code?: string;
    details?: unknown;
    responseBody?: unknown;
  }) {
    super(params.message);
    this.name = 'BrixApiError';
    this.status = params.status;
    this.statusText = params.statusText;
    this.url = params.url;
    this.code = params.code;
    this.details = params.details;
    this.responseBody = params.responseBody;
    Object.setPrototypeOf(this, BrixApiError.prototype);
  }

  static is(value: unknown): value is BrixApiError {
    return value instanceof BrixApiError;
  }
}

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === '[object Object]';
}

function buildQueryString(query?: BrixApiRequestOptions['query']): string {
  if (!query) return '';
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    params.append(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
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
  return typeof FormData !== 'undefined' && value instanceof FormData;
}

function isBlob(value: unknown): value is Blob {
  return typeof Blob !== 'undefined' && value instanceof Blob;
}

function isArrayBuffer(value: unknown): value is ArrayBuffer {
  return typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer;
}

function isArrayBufferView(value: unknown): value is ArrayBufferView {
  return typeof ArrayBuffer !== 'undefined' && ArrayBuffer.isView(value);
}

function isURLSearchParams(value: unknown): value is URLSearchParams {
  return typeof URLSearchParams !== 'undefined' && value instanceof URLSearchParams;
}

function serializeBody(body: unknown, headers: Headers): BodyInit | undefined {
  if (body === undefined) return undefined;
  if (body === null) return 'null';
  if (
    typeof body === 'string' ||
    isFormData(body) ||
    isBlob(body) ||
    isArrayBuffer(body) ||
    isArrayBufferView(body) ||
    isURLSearchParams(body)
  ) {
    return body as BodyInit;
  }

  if (body instanceof URL) {
    return body.toString();
  }

  if (isPlainObject(body) || Array.isArray(body)) {
    if (!headers.has('content-type')) {
      headers.set('content-type', 'application/json');
    }
    return JSON.stringify(body as JsonValue);
  }

  if (typeof body === 'number' || typeof body === 'boolean') {
    if (!headers.has('content-type')) {
      headers.set('content-type', 'application/json');
    }
    return JSON.stringify(body);
  }

  return String(body);
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';
  if (response.status === 204 || response.status === 205) return undefined;

  if (contentType.includes('application/json') || contentType.includes('+json')) {
    try {
      return await response.json();
    } catch {
      return undefined;
    }
  }

  try {
    return await response.text();
  } catch {
    return undefined;
  }
}

function resolveBaseUrl(baseUrl?: string): string {
  const fallback =
    typeof globalThis !== 'undefined' &&
    typeof (globalThis as { location?: Location }).location !== 'undefined' &&
    (globalThis as { location?: Location }).location?.origin
      ? (globalThis as { location?: Location }).location!.origin
      : '';
  return (baseUrl ?? fallback).replace(/\/+$/, '');
}

function joinUrl(baseUrl: string, path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

export function createBrixApiClient(options: BrixApiClientOptions = {}) {
  const baseUrl = resolveBaseUrl(options.baseUrl);
  const fetchImpl = options.fetchImpl ?? globalThis.fetch.bind(globalThis);

  async function request<T = unknown>(path: string, requestOptions: BrixApiRequestOptions = {}): Promise<T> {
    const url = `${joinUrl(baseUrl, path)}${buildQueryString(requestOptions.query)}`;
    const headers = mergeHeaders(options.defaultHeaders, requestOptions.headers);

    const token = options.getAuthToken?.();
    if (token && !headers.has('authorization')) {
      headers.set('authorization', `Bearer ${token}`);
    }

    const body = serializeBody(requestOptions.body, headers);

    const response = await fetchImpl(url, {
      ...requestOptions,
      headers,
      body,
    });

    const responseBody = await parseResponseBody(response);

    if (!response.ok) {
      const message =
        (isPlainObject(responseBody) && typeof responseBody.message === 'string' && responseBody.message) ||
        response.statusText ||
        `Request failed with status ${response.status}`;

      const code =
        isPlainObject(responseBody) && typeof responseBody.code === 'string' ? responseBody.code : undefined;

      const details =
        isPlainObject(responseBody) && 'details' in responseBody ? (responseBody as { details?: unknown }).details : undefined;

      const error = new BrixApiError({
        message,
        status: response.status,
        statusText: response.statusText,
        url,
        code,
        details,
        responseBody,
      });

      if (response.status === 401) {
        options.onUnauthorized?.();
      }

      throw error;
    }

    return responseBody as T;
  }

  return {
    request,
    get<T = unknown>(path: string, requestOptions: Omit<BrixApiRequestOptions, 'body'> = {}) {
      return request<T>(path, { ...requestOptions, method: 'GET' });
    },
    post<T = unknown>(path: string, body?: unknown, requestOptions: Omit<BrixApiRequestOptions, 'body'> = {}) {
      return request<T>(path, { ...requestOptions, method: 'POST', body });
    },
    put<T = unknown>(path: string, body?: unknown, requestOptions: Omit<BrixApiRequestOptions, 'body'> = {}) {
      return request<T>(path, { ...requestOptions, method: 'PUT', body });
    },
    patch<T = unknown>(path: string, body?: unknown, requestOptions: Omit<BrixApiRequestOptions, 'body'> = {}) {
      return request<T>(path, { ...requestOptions, method: 'PATCH', body });
    },
    delete<T = unknown>(path: string, requestOptions: Omit<BrixApiRequestOptions, 'body'> = {}) {
      return request<T>(path, { ...requestOptions, method: 'DELETE' });
    },
    head(path: string, requestOptions: Omit<BrixApiRequestOptions, 'body'> = {}) {
      return request<void>(path, { ...requestOptions, method: 'HEAD' });
    },
    options(path: string, requestOptions: Omit<BrixApiRequestOptions, 'body'> = {}) {
      return request<void>(path, { ...requestOptions, method: 'OPTIONS' });
    },
    baseUrl,
  };
}

export default createBrixApiClient;