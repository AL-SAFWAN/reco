"use client"

import { useEffect, useRef, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { X } from "lucide-react"
import {
  EMPTY_FILTERS,
  type Filters,
  filtersFromSearchParams,
  JobSearchForm,
  filtersToSearchParams,
} from "./job-search-form"
import { cn } from "@/lib/utils"

export function JobFilter({ className }: { className?: string }) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const filters = filtersFromSearchParams(searchParams)

  const setFilters = (newFilters: Filters) => {
    const qs = filtersToSearchParams(newFilters)
    router.replace(qs ? `?${qs}` : "?", { scroll: false })
  }

  const activeSpecialFilters = [
    filters.saved_only && { label: "Saved Jobs", key: "saved_only" as const },
    filters.purchased_only && {
      label: "Purchased Leads",
      key: "purchased_only" as const,
    },
    filters.open_only && { label: "Open Only", key: "open_only" as const },
  ].filter(Boolean) as { label: string; key: keyof Filters }[]

  return (
    <div className={cn("rounded-2xl border bg-card p-4 sm:p-5", className)}>
      <JobSearchForm filters={filters} onChange={setFilters} />
      {activeSpecialFilters.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {activeSpecialFilters.map(({ label, key }) => (
            <button
              key={key}
              onClick={() => setFilters({ ...filters, [key]: false })}
              className="inline-flex items-center gap-1 rounded-full bg-foreground px-3 py-1 text-xs font-semibold text-background hover:bg-foreground/80"
            >
              {label}
              <X className="size-3" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
