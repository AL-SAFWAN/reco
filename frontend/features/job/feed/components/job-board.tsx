"use client"

import { useMemo } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import {
  filtersFromSearchParams,
  filtersToSearchParams,
} from "./job-search-form"
import { JobCard } from "./job-card"
import {
  useUserLeadsQuery,
  useMarketplaceJobsQuery,
  useSavedJobsQuery,
} from "../../hooks/job"
import { SearchX } from "lucide-react"

export function JobBoard() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const filters = useMemo(
    () => filtersFromSearchParams(searchParams),
    [searchParams]
  )

  const { data = [] } = useMarketplaceJobsQuery()
  const { data: savedJobs = [] } = useSavedJobsQuery()
  const { data: purchasedLeads = [] } = useUserLeadsQuery()

  const savedIds = new Set(savedJobs.map((s) => s.job_id))
  const purchasedIds = new Set(purchasedLeads.map((l) => l.job_id))

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

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
        {results.length} job{results.length === 1 ? "" : "s"} available
      </p>
      {results.length > 0 ? (
        <div className="space-y-2">
          {results.map((job) => {
            const isActive = pathname === `/feed/${job.id}`
            return (
              <JobCard
                saved={savedIds.has(job.id)}
                key={job.id}
                job={job}
                selected={isActive}
                onSelect={() =>
                  router.push(
                    `/feed/${job.id}` + `?${filtersToSearchParams(filters)}`
                  )
                }
              />
            )
          })}
        </div>
      ) : (
        <div className="flex h-full min-h-[40vh] flex-col items-center justify-center gap-3 rounded-2xl border text-center">
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
