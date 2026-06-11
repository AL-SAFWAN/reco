import { Suspense } from "react"
import { JobBoard } from "@/features/job/feed/components/job-board"

export default function Page() {
  return (
    <div>
      <div className="bg-foreground px-4 py-10 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-4xl font-black tracking-tight text-background sm:text-5xl">
            Job Feed
          </h1>
          <p className="mt-2 text-sm text-background/40">
            Browse and purchase recovery leads in your area.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Suspense>
          <JobBoard />
        </Suspense>
      </div>
    </div>
  )
}
