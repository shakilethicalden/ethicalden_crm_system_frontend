import axios, { AxiosError, type AxiosRequestConfig, type Method } from "axios";
import { getAccessToken } from "@/libs/auth/session";

export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? "https://crm.mrshakil.com/api";

/** Origin of the API server, used to resolve relative `/media/...` paths. */
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

/** GET responses younger than this are returned without touching the network. */
const FRESH_MS = 30_000;

declare module "axios" {
  interface AxiosRequestConfig {
    /** Skip attaching the stored access token (e.g. for login). */
    skipAuth?: boolean;
  }
}

/** Error thrown for every failed request — `message` is always human readable. */
export class ApiError extends Error {
  readonly status: number;
  readonly data: unknown;
  readonly isCanceled: boolean;

  constructor(message: string, status = 0, data: unknown = null, isCanceled = false) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.isCanceled = isCanceled;
  }
}

/** Shared axios instance. Use `apiRequest` in services; use `http` directly only for special cases. */
export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30_000,
  headers: { Accept: "application/json" },
});

http.interceptors.request.use((config) => {
  const token = config.skipAuth ? null : getAccessToken();

  if (token && !config.headers.has("Authorization")) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }

  // Let the browser set multipart boundaries for FormData.
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    config.headers.delete("Content-Type");
  }

  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(toApiError(error)),
);

export type ApiRequestOptions = {
  method?: Method;
  /** JSON body (object) or FormData. */
  data?: unknown;
  /** Query string parameters. */
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
  /** `"no-store"` bypasses the GET cache (always hits the network). */
  cache?: "default" | "no-store";
  /** Abort the request (e.g. when a page unmounts). */
  signal?: AbortSignal;
  skipAuth?: boolean;
};

/**
 * Options for a `useAsyncData` loader call: bypass the cache on explicit refresh (`fresh`)
 * and cancel the request when the component unmounts (`signal`).
 *
 * @example useAsyncData((fresh, signal) => leadService.list({}, requestOptions(fresh, signal)), [], { key: "leads" })
 */
export function requestOptions(fresh: boolean, signal?: AbortSignal): ApiRequestOptions {
  return { cache: fresh ? "no-store" : "default", signal };
}

type CacheEntry = { data: unknown; updatedAt: number };

const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<unknown>>();

function cacheKey(path: string, params?: Record<string, unknown>) {
  const token = getAccessToken() ?? "";
  return `${token.slice(-16)}|${path}|${params ? JSON.stringify(params) : ""}`;
}

/**
 * Request helper used by every service.
 *
 * GET requests are cached in memory:
 * - fresh (< 30 s) → returned instantly, no request
 * - older / invalidated → re-fetched (callers that need instant stale data use `peekCache`)
 * - identical in-flight GETs share one request
 * Any successful mutation marks the whole cache stale (kept for instant display, refetched on next use).
 */
export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { method = "GET", cache: cacheMode = "default", signal, ...rest } = options;
  const upperMethod = method.toUpperCase();
  const config: AxiosRequestConfig = { url: path, method: upperMethod, signal, ...rest };

  if (upperMethod !== "GET") {
    const response = await http.request<T>(config);
    invalidateApiCache();
    return response.data;
  }

  const key = cacheKey(path, options.params);
  const cached = cache.get(key);

  if (cacheMode !== "no-store" && cached && Date.now() - cached.updatedAt < FRESH_MS) {
    return cached.data as T;
  }

  const pending = inflight.get(key);

  if (pending && cacheMode !== "no-store") {
    return pending as Promise<T>;
  }

  // The shared request is not tied to one caller's signal, so one page leaving never cancels
  // another page's identical request; each caller still stops waiting when its own signal aborts.
  const request = http
    .request<T>({ ...config, signal: undefined })
    .then((response) => {
      cache.set(key, { data: response.data, updatedAt: Date.now() });
      return response.data;
    })
    .finally(() => inflight.delete(key));

  inflight.set(key, request);
  return signal ? raceAbort(request, signal) : request;
}

/** Last cached GET response for `path` (any age), for instant stale-while-revalidate display. */
export function peekCache<T>(path: string, params?: Record<string, unknown>): T | undefined {
  return cache.get(cacheKey(path, params))?.data as T | undefined;
}

/** Mark every cached GET as stale: still available to `peekCache`, re-fetched on next request. */
export function invalidateApiCache() {
  cache.forEach((entry) => {
    entry.updatedAt = 0;
  });
}

/** Drop everything (e.g. on logout). */
export function clearApiCache() {
  cache.clear();
  inflight.clear();
}

function raceAbort<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  if (signal.aborted) {
    return Promise.reject(new ApiError("Request canceled.", 0, null, true));
  }

  return new Promise<T>((resolve, reject) => {
    const onAbort = () => reject(new ApiError("Request canceled.", 0, null, true));
    signal.addEventListener("abort", onAbort, { once: true });
    promise.then(resolve, reject).finally(() => signal.removeEventListener("abort", onAbort));
  });
}

function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (axios.isCancel(error)) {
    return new ApiError("Request canceled.", 0, null, true);
  }

  if (error instanceof AxiosError) {
    const status = error.response?.status ?? 0;
    const payload = error.response?.data as Record<string, unknown> | undefined;

    if (!error.response) {
      const message =
        error.code === "ECONNABORTED" ? "The server took too long to respond." : "Network error. Check your connection.";
      return new ApiError(message, 0, null);
    }

    const message =
      (typeof payload?.message === "string" && payload.message) ||
      (typeof payload?.detail === "string" && payload.detail) ||
      formatApiErrors(payload) ||
      "Something went wrong. Please try again.";

    return new ApiError(message, status, payload ?? null);
  }

  return new ApiError(error instanceof Error ? error.message : "Something went wrong.");
}

function formatApiErrors(payload: unknown): string {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  return Object.entries(payload)
    .map(([field, value]) => `${field}: ${formatApiErrorValue(value)}`)
    .join(" | ");
}

function formatApiErrorValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (value && typeof value === "object") {
    return Object.entries(value)
      .map(([field, nestedValue]) => `${field}: ${formatApiErrorValue(nestedValue)}`)
      .join(", ");
  }

  return String(value);
}
