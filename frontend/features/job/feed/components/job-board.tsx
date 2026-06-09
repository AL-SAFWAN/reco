"use client"

import { useMemo, useState } from "react"
import { SearchX } from "lucide-react"
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

export function JobBoard() {
  const { data = [] } = useMarketplaceJobsQuery()
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [selectedId, setSelectedId] = useState<string>(data[0]?.id ?? "")

  const { data: savedJobs = [] } = useSavedJobsQuery()
  const savedIds = new Set(savedJobs.map((s) => s.job_id))
  const saveJobMutation = useSaveJobMutation()
  const unsaveJobMutation = useUnsaveJobMutation()

  const { data: purchasedLeads = [] } = useUserLeadsQuery()

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
        (!filters.open_only || job.lead_status === "open")
      )
    })
  }, [filters, data])

  const selected = results.find((j) => j.id === selectedId) ?? results[0]

  const toggleSave = (id: string) => {
    if (savedIds.has(id)) {
      unsaveJobMutation.mutate(id)
    } else {
      saveJobMutation.mutate(id)
    }
  }

  return (
    <div className="space-y-6">
      {/* Filter bar */}
      <div className="rounded-2xl border bg-card p-4 sm:p-5">
        <JobSearchForm
          filters={filters}
          onChange={setFilters}
          onReset={() => setFilters(EMPTY_FILTERS)}
        />
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
