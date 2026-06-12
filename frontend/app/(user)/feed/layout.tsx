"use client"

import { usePathname } from "next/navigation"
import { JobBoard } from "@/features/job/feed/components/job-board"
import { JobFilter } from "@/features/job/feed/components/job-filter"
import { cn } from "@/lib/utils"

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  // Matches /feed/<id> — any segment after /feed/
  const isDetailPage = /^\/feed\/.+/.test(pathname)

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
        <div className="space-y-6">
          <JobFilter />
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,400px)_1fr]">
            {/* Job list — hidden on mobile when viewing a detail page */}
            <div className={cn(isDetailPage && "hidden lg:block")}>
              <JobBoard />
            </div>
            {/* Detail pane — hidden on mobile when on the list-only page; sticky on desktop */}
            <main className={cn("lg:sticky lg:top-4", !isDetailPage && "hidden lg:block")}>
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}
