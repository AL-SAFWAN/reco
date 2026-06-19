"use client"
import { useMemo } from "react"
import { JobDetail } from "@/features/job/feed/components/job-details"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  useMarketplaceJobQuery,
  useSavedJobsQuery,
  useSaveJobMutation,
  useUnsaveJobMutation,
  useUserLeadsQuery,
} from "@/features/job/hooks/job"

export default function Page() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data, isLoading, isError } = useMarketplaceJobQuery(id)

  const { data: savedJobs = [] } = useSavedJobsQuery()
  const { data: purchasedLeads = [] } = useUserLeadsQuery()

  const saveJobMutation = useSaveJobMutation()
  const unsaveJobMutation = useUnsaveJobMutation()

  const saved = useMemo(
    () => savedJobs.some((s) => s.job_id === id),
    [savedJobs, id]
  )
  const purchased = useMemo(
    () => purchasedLeads.some((lead) => lead.job_id === id),
    [purchasedLeads, id]
  )

  const toggleSave = (id: string) => {
    if (unsaveJobMutation.isPending || saveJobMutation.isPending) return
    if (saved) {
      unsaveJobMutation.mutate(id)
    } else {
      saveJobMutation.mutate(id)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[40vh] items-center justify-center rounded-2xl border">
        <Loader2 className="size-8 animate-spin text-muted-foreground/40" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 gap-1.5 lg:hidden"
          onClick={() => router.push("/feed")}
        >
          <ArrowLeft className="size-4" />
          Back to jobs
        </Button>
        <div className="flex h-full min-h-[40vh] flex-col items-center justify-center gap-3 rounded-2xl border text-center">
          <AlertCircle className="size-12 text-muted-foreground/30" />
          <div>
            <p className="text-base font-bold text-foreground">Job not found</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              This job may have been removed or the link is invalid.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/feed")}
          >
            Browse all jobs
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Back button — mobile only */}
      <Button
        variant="ghost"
        size="sm"
        className="mb-4 gap-1.5 lg:hidden"
        onClick={() => router.push("/feed")}
      >
        <ArrowLeft className="size-4" />
        Back to jobs
      </Button>
      <JobDetail
        job={data}
        saved={saved}
        purchased={purchased}
        onToggleSave={() => toggleSave(data.id)}
      />
    </div>
  )
}
