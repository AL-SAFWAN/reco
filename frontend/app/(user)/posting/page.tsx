"use client"
import { DataTable } from "@/features/job/post/components/data-table"
import { columns } from "@/features/job/post/components/columns"
import { useJobsQuery } from "@/features/job/hooks/job"

export default function Page() {
  const { data = [] } = useJobsQuery()
  return (
    <div>
      <div className="bg-foreground px-4 py-10 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-4xl font-black tracking-tight text-background sm:text-5xl">
            Your Job Postings
          </h1>
          <p className="mt-2 text-sm text-background/40">
            View and manage your active and past job postings.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <DataTable data={data} columns={columns} />
      </div>
    </div>
  )
}
