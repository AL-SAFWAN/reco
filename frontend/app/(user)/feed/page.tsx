import { MousePointerClick } from "lucide-react"

export default function Page() {
  return (
    <div className="hidden h-full min-h-[40vh] flex-col items-center justify-center gap-3 rounded-2xl border text-center lg:flex">
      <MousePointerClick className="size-12 text-muted-foreground/20" />
      <div>
        <p className="text-base font-bold text-foreground">Select a job</p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Choose a recovery job from the list to view details.
        </p>
      </div>
    </div>
  )
}
