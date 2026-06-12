"use client"

import { fetchWithErrorHandling } from "./baseFetcher"

function normalizeHeaders(headers?: HeadersInit): Record<string, string> {
  if (!headers) {
    return {}
  }

  if (headers instanceof Headers) {
    const record: Record<string, string> = {}
    headers.forEach((value, key) => {
      record[key] = value
    })
    return record
  } else if (Array.isArray(headers)) {
    return headers.reduce(
      (acc, [key, value]) => {
        acc[key] = value
        return acc
      },
      {} as Record<string, string>
    )
  } else {
    return { ...headers }
  }
}

export interface CustomFetchOptions extends Omit<RequestInit, "body"> {
  body?: Record<string, any> | BodyInit | null
}

export default async function clientFetcher<T = any>(
  url: string,
  options: CustomFetchOptions = {}
): Promise<T> {
  let { body, headers, ...restOptions } = options

  const normalizedHeaders: Record<string, string> = {
    Accept: "application/json",
    ...normalizeHeaders(headers),
  }
  const contentType = normalizedHeaders["content-type"]

  if (body && typeof body === "object") {
    if (contentType !== "application/x-www-form-urlencoded") {
      normalizedHeaders["Content-Type"] = "application/json"
      body = JSON.stringify(body)
    } else {
      const urlSearchParams = new URLSearchParams(body as Record<string, any>)
      body = urlSearchParams.toString()
    }
  }

  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null
  if (token && !normalizedHeaders["Authorization"]) {
    normalizedHeaders["Authorization"] = `Bearer ${token}`
  }

  const response = await fetchWithErrorHandling(url, {
    ...restOptions,
    method: options.method || "GET", // Default to GET if method not specified
    headers: normalizedHeaders,
    body,
  })

  return response
}
