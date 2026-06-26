"use client"
import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form"
import { Coins, Info } from "lucide-react"
import {
  SERVICE_TYPES,
  VEHICLE_CLASSES,
  URGENCY_OPTIONS,
  AREAS,
} from "@/lib/job-data"
import { type JobCreate } from "../../schema/jobSchema"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// ── Shared form fields ────────────────────────────────────────────

export default function JobFormFields({
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
      {/* customer */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Field data-invalid={!!errors.customer_name}>
          <FieldLabel htmlFor="customer_name">Name</FieldLabel>
          <Input
            id="customer_name"
            placeholder="John Doe"
            type="text"
            autoCapitalize="none"
            autoComplete="name"
            autoCorrect="off"
            {...register("customer_name")}
            aria-invalid={!!errors.customer_name}
          />
          {errors.customer_name && (
            <FieldError errors={[errors.customer_name]} />
          )}
        </Field>
        <Field data-invalid={!!errors.customer_phone}>
          <FieldLabel htmlFor="customer_phone">Phone</FieldLabel>
          <Input
            id="customer_phone"
            placeholder="(123) 456-7890"
            type="tel"
            autoCapitalize="none"
            autoComplete="tel"
            autoCorrect="off"
            {...register("customer_phone")}
            aria-invalid={!!errors.customer_phone}
          />
          {errors.customer_phone && (
            <FieldError errors={[errors.customer_phone]} />
          )}
        </Field>
        <Field data-invalid={!!errors.customer_email}>
          <FieldLabel htmlFor="customer_email">Email</FieldLabel>
          <Input
            id="customer_email"
            placeholder="customer@example.com"
            type="email"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect="off"
            {...register("customer_email")}
            aria-invalid={!!errors.customer_email}
          />
          {errors.customer_email && (
            <FieldError errors={[errors.customer_email]} />
          )}
        </Field>
        <Controller
          name="send_email_notification"
          control={control}
          render={({ field }) => (
            <Field orientation="horizontal" className="col-span-full">
              <Checkbox
                id="send_email_notification"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
              <FieldLabel
                htmlFor="send_email_notification"
                className="cursor-pointer font-medium"
              >
                Send email notification to customer to update Job details
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="size-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    If checked, the customer will receive an email with a link
                    to update the job details themselves. This can help reduce
                    back-and-forth communication between the provider and
                    customer, and ensure the job information is accurate and
                    up-to-date.
                  </TooltipContent>
                </Tooltip>
              </FieldLabel>
            </Field>
          )}
        />
      </div>
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
          <FieldLabel htmlFor="lead_price">
            <span className="inline-flex items-center gap-0.5">
              Lead price (<Coins className="size-4" />)
            </span>
          </FieldLabel>
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
