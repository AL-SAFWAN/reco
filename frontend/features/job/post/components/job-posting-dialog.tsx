"use client"

import { useEffect, useState } from "react"
import {
  Controller,
  useForm,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderPinwheel, Plus } from "lucide-react"
import {
  SERVICE_TYPES,
  VEHICLE_CLASSES,
  URGENCY_OPTIONS,
  AREAS,
} from "@/lib/job-data"
import {
  jobCreateSchema,
  statusLabels,
  statusSchema,
  type Job,
  type JobCreate,
} from "../../schema/jobSchema"
import { useCreateJobMutation, useUpdateJobMutation } from "../../hooks/job"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// ── Shared form fields ────────────────────────────────────────────

function JobFormFields({
  register,
  control,
  errors,
}: {
  register: UseFormRegister<JobCreate>
  control: Control<JobCreate>
  errors: FieldErrors<JobCreate>
}) {
  return (
    <div className="grid gap-5 overflow-y-auto px-6 pt-5 pb-5">
      {/* Service + Urgency */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Controller
          name="service_type"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="service_type">Service type</FieldLabel>
              <Select
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  id="service_type"
                  aria-invalid={fieldState.invalid}
                  className="w-full"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_TYPES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="urgency"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="urgency">Urgency</FieldLabel>
              <Select
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  id="urgency"
                  aria-invalid={fieldState.invalid}
                  className="w-full"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {URGENCY_OPTIONS.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

      {/* Vehicle */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Controller
          name="vehicle_class"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="vehicle_class">Vehicle class</FieldLabel>
              <Select
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  id="vehicle_class"
                  aria-invalid={fieldState.invalid}
                  className="w-full"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VEHICLE_CLASSES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Field data-invalid={!!errors.vehicle_make_model}>
          <FieldLabel htmlFor="vehicle_make_model">Make &amp; model</FieldLabel>
          <Input
            id="vehicle_make_model"
            placeholder="e.g. Ford Transit (2020)"
            aria-invalid={!!errors.vehicle_make_model}
            {...register("vehicle_make_model")}
          />
          {errors.vehicle_make_model && (
            <FieldError errors={[errors.vehicle_make_model]} />
          )}
        </Field>
        <Field data-invalid={!!errors.vehicle_reg}>
          <FieldLabel htmlFor="vehicle_reg">Registration</FieldLabel>
          <Input
            id="vehicle_reg"
            placeholder="e.g. AB12 CDE"
            aria-invalid={!!errors.vehicle_reg}
            {...register("vehicle_reg", {
              setValueAs: (v: string) => v.toUpperCase(),
            })}
          />
          {errors.vehicle_reg && <FieldError errors={[errors.vehicle_reg]} />}
        </Field>
      </div>

      {/* Locations */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field data-invalid={!!errors.pickup_location}>
          <FieldLabel htmlFor="pickup_location">Pickup location</FieldLabel>
          <Input
            id="pickup_location"
            placeholder="e.g. A406, Brent Cross"
            aria-invalid={!!errors.pickup_location}
            {...register("pickup_location")}
          />
          {errors.pickup_location && (
            <FieldError errors={[errors.pickup_location]} />
          )}
        </Field>
        <Controller
          name="pickup_area"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="pickup_area">Area</FieldLabel>
              <Select
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  id="pickup_area"
                  aria-invalid={fieldState.invalid}
                  className="w-full"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AREAS.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

      <Field data-invalid={!!errors.dropoff_location}>
        <FieldLabel htmlFor="dropoff_location">Drop-off location</FieldLabel>
        <Input
          id="dropoff_location"
          placeholder="e.g. Garage name & postcode, or 'On-site fix'"
          aria-invalid={!!errors.dropoff_location}
          {...register("dropoff_location")}
        />
        {errors.dropoff_location && (
          <FieldError errors={[errors.dropoff_location]} />
        )}
      </Field>

      {/* Pricing + Distance */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Field data-invalid={!!errors.lead_price}>
          <FieldLabel htmlFor="lead_price">Lead price (£)</FieldLabel>
          <Input
            id="lead_price"
            type="number"
            min={0}
            aria-invalid={!!errors.lead_price}
            {...register("lead_price", { valueAsNumber: true })}
          />
          {errors.lead_price && <FieldError errors={[errors.lead_price]} />}
        </Field>
        <Field data-invalid={!!errors.estimated_payout}>
          <FieldLabel htmlFor="estimated_payout">
            Estimated payout (£)
          </FieldLabel>
          <Input
            id="estimated_payout"
            type="number"
            min={0}
            aria-invalid={!!errors.estimated_payout}
            {...register("estimated_payout", { valueAsNumber: true })}
          />
          {errors.estimated_payout && (
            <FieldError errors={[errors.estimated_payout]} />
          )}
        </Field>
        <Field data-invalid={!!errors.distance_miles}>
          <FieldLabel htmlFor="distance_miles">Distance (miles)</FieldLabel>
          <Input
            id="distance_miles"
            type="number"
            min={0}
            step={0.1}
            aria-invalid={!!errors.distance_miles}
            {...register("distance_miles", { valueAsNumber: true })}
          />
          {errors.distance_miles && (
            <FieldError errors={[errors.distance_miles]} />
          )}
        </Field>
      </div>

      {/* Drivable */}
      <Controller
        name="is_drivable"
        control={control}
        render={({ field }) => (
          <Field orientation="horizontal">
            <Checkbox
              id="is_drivable"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
            <FieldLabel
              htmlFor="is_drivable"
              className="cursor-pointer font-medium"
            >
              Vehicle is drivable
            </FieldLabel>
          </Field>
        )}
      />

      {/* Description */}
      <Field data-invalid={!!errors.description}>
        <FieldLabel htmlFor="description">Description &amp; notes</FieldLabel>
        <Textarea
          id="description"
          rows={4}
          placeholder="Describe the breakdown, hazards, and anything the provider should know."
          aria-invalid={!!errors.description}
          {...register("description")}
        />
        {errors.description && <FieldError errors={[errors.description]} />}
      </Field>
    </div>
  )
}

// ── Create Dialog ─────────────────────────────────────────────────

export function CreateJobDialog() {
  const [open, setOpen] = useState(false)
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
    },
  })

  function onSubmit(data: JobCreate) {
    mutate(data, {
      onSuccess: () => {
        reset()
        setOpen(false)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="size-4" />
          Add Job Posting
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Post a recovery job</DialogTitle>
          <DialogDescription>
            Provide the breakdown details. Service providers will be able to buy
            this job lead.
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
              onClick={() => setOpen(false)}
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
  )
}

// ── Edit Dialog ───────────────────────────────────────────────────

export function EditJobDialog({
  job,
  open,
  onOpenChange,
}: {
  job: Job
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { mutate, isPending } = useUpdateJobMutation()

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JobCreate>({
    resolver: zodResolver(jobCreateSchema),
    defaultValues: job,
  })

  useEffect(() => {
    if (open) reset(job)
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  function onSubmit(data: JobCreate) {
    console.log("Updating job with data:", data)
    mutate({ id: job.id, body: data }, { onSuccess: () => onOpenChange(false) })
  }
  console.log(errors) // Log form state for debugging
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Edit job posting </DialogTitle>
          <DialogDescription>
            Updating
            <span className="font-mono text-xs text-muted-foreground italic">
              {" "}
              {job.id}{" "}
            </span>
            job
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="grid gap-5 overflow-y-auto px-6">
            {/* Service + Urgency */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                name="lead_status"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="lead_status">Status</FieldLabel>
                    <Select
                      name={field.name}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger
                        id="lead_status"
                        aria-invalid={fieldState.invalid}
                        className="w-full"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusSchema.options.map((s) => (
                          <SelectItem key={s} value={s}>
                            {statusLabels[s]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>{" "}
          </div>
          <JobFormFields
            register={register}
            control={control}
            errors={errors}
          />
          <DialogFooter className="mx-0 mb-0 border-t px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && (
                <LoaderPinwheel className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
