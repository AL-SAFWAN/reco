"use client"

import { useMemo, useState } from "react"
import { SearchX } from "lucide-react"
import { EMPTY_FILTERS, type Filters, JobSearchForm } from "./job-search-form"
import { JobCard } from "./job-card"
import { JobDetail } from "./job-details"
import { useJobsQuery } from "../../hooks/job"

export function JobBoard() {
  const { data = [] } = useJobsQuery()
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [selectedId, setSelectedId] = useState<string>(data[0]?.id ?? "")

  const [savedIds, setSavedIds] = useState<Set<string>>(() => new Set())
  const [purchasedIds, setPurchasedIds] = useState<Set<string>>(() => new Set())

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
        (!filters.open_only || job.status === "open")
      )
    })
  }, [filters, data])

  const selected = results.find((j) => j.id === selectedId) ?? results[0]

  const toggleSave = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const buyJob = (id: string) => {
    setPurchasedIds((prev) => new Set(prev).add(id))
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-4 sm:p-5">
        <JobSearchForm
          filters={filters}
          onChange={setFilters}
          onReset={() => setFilters(EMPTY_FILTERS)}
        />
      </div>

      {results.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {results.length} recovery job{results.length === 1 ? "" : "s"}{" "}
              available
            </p>
            <div className="space-y-3">
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

          <div className="lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
            {selected && (
              <JobDetail
                job={selected}
                saved={savedIds.has(selected.id)}
                purchased={purchasedIds.has(selected.id)}
                onToggleSave={() => toggleSave(selected.id)}
                onBuy={() => buyJob(selected.id)}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
          <SearchX className="size-12 text-muted-foreground" />
          <div>
            <p className="text-lg font-semibold text-foreground">
              No recovery jobs found
            </p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your filters or widening your search area.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
