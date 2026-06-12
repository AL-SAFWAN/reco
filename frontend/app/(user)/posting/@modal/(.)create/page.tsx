"use client"

import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CreateJobForm } from "@/features/job/post/components/job-posting-dialog"
import { Button } from "@/components/ui/button"
import { Maximize2 } from "lucide-react"

export default function CreateJobModal() {
  const router = useRouter()

  function dismiss() {
    router.back()
  }

  return (
    <Dialog open onOpenChange={(open) => !open && dismiss()}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Post a recovery job</DialogTitle>
          <DialogDescription>
            Provide the breakdown details. Service providers will be able to buy
            this job lead.
          </DialogDescription>
        </DialogHeader>
        <CreateJobForm
          onSuccess={() => router.push("/posting")}
          onCancel={dismiss}
        />
      </DialogContent>
    </Dialog>
  )
}
