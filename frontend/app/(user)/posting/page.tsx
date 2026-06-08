"use client"
import { DataTable } from "@/features/job/post/components/data-table"
import { columns } from "@/features/job/post/components/columns"
import { useJobsQuery } from "@/features/job/hooks/job"

export default function Page() {
  const { data = [] } = useJobsQuery()
  return (
    <>
      <div className="flex h-full flex-1 flex-col gap-8 p-8">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-semibold tracking-tight">
              Welcome back!
            </h2>
            <p className="text-muted-foreground">
              Here&apos;s a list of your job postings for this month.
            </p>
          </div>
        </div>
        <DataTable data={data} columns={columns} />
      </div>
    </>
  )
}
