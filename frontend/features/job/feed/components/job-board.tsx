"use client"

import { useCallback, useMemo, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { SearchX, X } from "lucide-react"
import { EMPTY_FILTERS, type Filters, JobSearchForm } from "./job-search-form"
import { JobCard } from "./job-card"
import { JobDetail } from "./job-details"
import {
  useUserLeadsQuery,
  useMarketplaceJobsQuery,
  useSavedJobsQuery,
  useSaveJobMutation,
  useUnsaveJobMutation,
} from "../../hooks/job"

function filtersFromSearchParams(
  params: ReturnType<typeof useSearchParams>
): Filters {
  return {
    query: params.get("query") ?? "",
    service_type: params.get("service_type") ?? "",
    vehicle_class: params.get("vehicle_class") ?? "",
    urgency: params.get("urgency") ?? "",
    area: params.get("area") ?? "",
    open_only: params.get("open_only") === "true",
    saved_only: params.get("saved_only") === "true",
    purchased_only: params.get("purchased_only") === "true",
  }
}

function filtersToQueryString(filters: Filters): string {
  const params = new URLSearchParams()
  if (filters.query) params.set("query", filters.query)
  if (filters.service_type) params.set("service_type", filters.service_type)
  if (filters.vehicle_class) params.set("vehicle_class", filters.vehicle_class)
  if (filters.urgency) params.set("urgency", filters.urgency)
  if (filters.area) params.set("area", filters.area)
  if (filters.open_only) params.set("open_only", "true")
  if (filters.saved_only) params.set("saved_only", "true")
  if (filters.purchased_only) params.set("purchased_only", "true")
  return params.toString()
}

export function JobBoard() {
  const { data = [] } = useMarketplaceJobsQuery()
  const searchParams = useSearchParams()
  const router = useRouter()
  const filters = useMemo(
    () => filtersFromSearchParams(searchParams),
    [searchParams]
  )
  const [selectedId, setSelectedId] = useState<string>(data[0]?.id ?? "")

  const { data: savedJobs = [] } = useSavedJobsQuery()
  const savedIds = new Set(savedJobs.map((s) => s.job_id))
  const saveJobMutation = useSaveJobMutation()
  const unsaveJobMutation = useUnsaveJobMutation()

  const { data: purchasedLeads = [] } = useUserLeadsQuery()
  const purchasedIds = new Set(purchasedLeads.map((l) => l.job_id))

  const setFilters = useCallback(
    (newFilters: Filters) => {
      const qs = filtersToQueryString(newFilters)
      router.replace(qs ? `?${qs}` : "?", { scroll: false })
    },
    [router]
  )

  const results = useMemo(() => {
    return data.filter((job) => {
      const haystack =
        `${job.id} ${job.pickup_location} ${job.pickup_area} ${job.vehicle_make_model} ${job.service_type}`.toLowerCase()
      return (
        (!filters.query || haystack.includes(filters.query.toLowerCase())) &&
        (!filters.service_type || job.service_type === filters.service_type) &&
        (!filters.vehicle_class ||
          job.vehicle_class === filters.vehicle_class) &&
        (!filters.urgency || job.urgency === filters.urgency) &&
        (!filters.area || job.pickup_area === filters.area) &&
        (!filters.open_only || job.lead_status === "open") &&
        (!filters.saved_only || savedIds.has(job.id)) &&
        (!filters.purchased_only || purchasedIds.has(job.id))
      )
    })
  }, [filters, data, savedIds, purchasedIds])

  const selected = results.find((j) => j.id === selectedId) ?? results[0]

  const toggleSave = (id: string) => {
    if (savedIds.has(id)) {
      unsaveJobMutation.mutate(id)
    } else {
      saveJobMutation.mutate(id)
    }
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
    <div className="space-y-6">
      {/* Filter bar */}
      <div className="rounded-2xl border bg-card p-4 sm:p-5">
        <JobSearchForm
          filters={filters}
          onChange={setFilters}
          onReset={() => setFilters(EMPTY_FILTERS)}
        />
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

      {results.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,400px)_1fr]">
          {/* List */}
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              {results.length} job{results.length === 1 ? "" : "s"} available
            </p>
            <div className="space-y-2">
              {results.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  selected={selected?.id === job.id}
                  onSelect={() => setSelectedId(job.id)}
                />
              ))}
            </div>
          </div>

          {/* Detail */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            {selected && (
              <JobDetail
                job={selected}
                saved={savedIds.has(selected.id)}
                purchased={purchasedLeads.some(
                  (lead) => lead.job_id === selected.id
                )}
                onToggleSave={() => toggleSave(selected.id)}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
          <SearchX className="size-12 text-muted-foreground/30" />
          <div>
            <p className="text-base font-bold text-foreground">
              No recovery jobs found
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Try adjusting your filters or widening your search area.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
