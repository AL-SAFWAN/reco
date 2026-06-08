import { JobBoard } from "@/features/job/feed/components/job-board"

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 flex items-center justify-between gap-2">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-semibold tracking-tight">
              Search Jobs!
            </h2>
            <p className="text-muted-foreground">View you&apos;re last feed.</p>
          </div>
        </div>
        <JobBoard />
      </section>
    </main>
  )
}
