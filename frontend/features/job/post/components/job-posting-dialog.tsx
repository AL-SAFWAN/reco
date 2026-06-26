"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderPinwheel, Plus } from "lucide-react"
import { AREAS } from "@/lib/job-data"
import { jobCreateSchema, type JobCreate } from "../../schema/jobSchema"
import { useCreateJobMutation } from "../../hooks/job"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Link from "next/dist/client/link"
import JobFormFields from "./share-form"
import { useRouter } from "next/navigation"

// ── Create Form (no dialog wrapper — used by the routing-modal pattern) ──────

export function CreateJobForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: () => void
  onCancel: () => void
}) {
  const { mutate, isPending } = useCreateJobMutation()

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JobCreate>({
    resolver: zodResolver(jobCreateSchema),
    defaultValues: {
      service_type: "Towing & Transport",
      urgency: "Immediate",
      vehicle_class: "Car",
      is_drivable: true,
      pickup_area: AREAS[0],
      lead_price: 10,
      estimated_payout: 120,
      distance_miles: 0,
      customer_name: "",
      customer_email: "",
      customer_phone: "",
      send_email_notification: true,
    },
  })

  function onSubmit(data: JobCreate) {
    mutate(data, {
      onSuccess: () => {
        reset()
        onSuccess()
      },
    })
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex min-h-0 flex-1 flex-col"
    >
      <JobFormFields register={register} control={control} errors={errors} />
      <DialogFooter className="mx-0 mb-0 border-t px-6 py-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && (
            <LoaderPinwheel className="mr-2 h-4 w-4 animate-spin" />
          )}
          {isPending ? "Posting..." : "Post job"}
        </Button>
      </DialogFooter>
    </form>
  )
}

// ── Create Dialog ─────────────────────────────────────────────────

export function CreateJobDialog() {
  const router = useRouter()
  const { mutate, isPending } = useCreateJobMutation()

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JobCreate>({
    resolver: zodResolver(jobCreateSchema),
    defaultValues: {
      service_type: "Towing & Transport",
      urgency: "Immediate",
      vehicle_class: "Car",
      is_drivable: true,
      pickup_area: AREAS[0],
      lead_price: 10,
      estimated_payout: 120,
      distance_miles: 0,
      customer_name: "",
      customer_email: "",
      customer_phone: "",
      send_email_notification: true,
    },
  })

  function onSubmit(data: JobCreate) {
    mutate(data, {
      onSuccess: () => {
        reset()
      },
    })
  }

  return (
    <>
      <Dialog>
        <DialogTrigger asChild className="hidden sm:flex">
          <Button className="w-full gap-2 sm:w-fit">
            <Plus className="size-4" />
            Add Job Posting
          </Button>
        </DialogTrigger>
        <Button className="w-full gap-2 sm:hidden sm:w-fit" asChild>
          <Link href="/posting/create">
            <Plus className="size-4" />
            Add Job Posting
          </Link>
        </Button>
        <DialogContent
          className="flex max-h-[90vh] flex-col overflow-hidden p-0 sm:max-w-2xl"
          onMaximize={() => {
            router.push("/posting/create")
          }}
        >
          <DialogHeader className="border-b px-6 py-4">
            <DialogTitle>Post a recovery job</DialogTitle>
            <DialogDescription>
              Provide the breakdown details. Service providers will be able to
              buy this job lead.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <JobFormFields
              register={register}
              control={control}
              errors={errors}
            />
            <DialogFooter className="mx-0 mb-0 border-t px-6 py-4">
              <Button
                type="button"
                variant="outline"
                // onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && (
                  <LoaderPinwheel className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isPending ? "Posting..." : "Post job"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
