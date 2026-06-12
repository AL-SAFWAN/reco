// lib/fetcher/server.fetcher.ts

import { fetchWithErrorHandling } from "./baseFetcher"

export default async function serverFetcher<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  return fetchWithErrorHandling(url, options)
}
