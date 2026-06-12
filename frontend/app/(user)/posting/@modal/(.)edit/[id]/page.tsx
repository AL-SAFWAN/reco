"use client"

import { useParams, useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { EditJobForm } from "@/features/job/post/components/job-posting-dialog"
import { useJobQuery } from "@/features/job/hooks/job"
import { Loader2, Maximize2 } from "lucide-react"

export default function EditJobModal() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: job, isLoading } = useJobQuery(id)

  function dismiss() {
    router.back()
  }

  return (
    <Dialog open onOpenChange={(open) => !open && dismiss()}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Edit job posting</DialogTitle>
          <DialogDescription>
            Updating{" "}
            <span className="font-mono text-xs text-muted-foreground italic">
              {id}
            </span>
          </DialogDescription>
        </DialogHeader>
        {isLoading || !job ? (
          <div className="flex min-h-40 items-center justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground/40" />
          </div>
        ) : (
          <EditJobForm
            job={job}
            onSuccess={() => router.push("/posting")}
            onCancel={dismiss}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
