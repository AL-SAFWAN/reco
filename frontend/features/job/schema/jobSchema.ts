import * as z from "zod"

export const statusSchema = z.enum(["open", "closed"])
export const statusLabels = {
  open: "Open",
  closed: "Closed",
}

export const serviceTypeSchema = z.enum([
  "Towing & Transport",
  "Jump Start",
  "Tyre Change",
  "Winch / Recovery",
  "Fuel Delivery",
  "EV Recovery",
  "Accident Recovery",
  "Others",
])

export const vehicleClassSchema = z.enum([
  "Car",
  "Van",
  "Motorcycle",
  "HGV / Truck",
  "EV",
  "Others",
])

export const urgencySchema = z.enum(["Immediate", "Scheduled"])

export const jobSchema = z.object({
  id: z.uuid(),
  service_type: serviceTypeSchema,
  urgency: urgencySchema,
  lead_status: statusSchema,
  created_at: z.string(),
  created_by_id: z.uuid(),
  /** What the provider pays to acquire this job lead */
  lead_price: z.number(),
  /** Estimated value of the job to the provider */
  estimated_payout: z.number(),
  distance_miles: z.number(),
  // Vehicle
  vehicle_class: vehicleClassSchema,
  vehicle_make_model: z.string(),
  vehicle_reg: z.string(),
  is_drivable: z.boolean(),
  // Locations
  pickup_location: z.string(),
  pickup_area: z.string(),
  dropoff_location: z.string().optional().nullable(),
  // Details
  description: z.string().optional().nullable(),
  max_buyers: z.number().default(1).optional().nullable(),
  purchase_count: z.number().default(0).optional().nullable(),
  closed_at: z.string().optional().nullable(),
  purchased: z.boolean().default(false),

  customer_name: z.string(),
  customer_email: z.email(),
  customer_phone: z.string(),
  send_email_notification: z.boolean(),
})

export const jobCreateSchema = z.object({
  service_type: serviceTypeSchema,
  urgency: urgencySchema,
  lead_status: statusSchema.optional(),
  lead_price: z.number(),
  estimated_payout: z.number(),
  distance_miles: z.number(),
  vehicle_class: vehicleClassSchema,
  vehicle_make_model: z.string().min(1, "Field is required"),
  vehicle_reg: z.string().min(1, "Field is required"),
  is_drivable: z.boolean(),
  pickup_location: z.string().min(1, "Field is required"),
  pickup_area: z.string().min(1, "Field is required"),
  dropoff_location: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  customer_name: z.string().min(1, "Field is required"),
  customer_email: z.email("Invalid email format").min(1, "Field is required"),
  customer_phone: z
    .string()
    .min(1, "Field is required")
    .regex(/^\+?[0-9\s\-]+$/, "Invalid phone number format"),
  send_email_notification: z.boolean(),
})

const leads = z.object({
  job_id: z.uuid(),
  purchased_at: z.string(),
})

export const jobUpdateSchema = jobCreateSchema.partial()

export const jobCustomerUpdateSchema = z.object({
  pickup_location: z.string().min(1, "Required").optional(),
  dropoff_location: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  customer_name: z.string().min(1, "Required").optional(),
  customer_phone: z
    .string()
    .regex(/^\+?[0-9\s\-]+$/, "Invalid phone number format")
    .optional(),
})

export const jobUpdateLogSchema = z.object({
  id: z.uuid(),
  job_id: z.uuid(),
  changed_by: z.string(),
  changes: z.record(
    z.string(),
    z.object({ old: z.unknown().nullable(), new: z.unknown().nullable() })
  ),
  changed_at: z.string(),
})

export type Job = z.infer<typeof jobSchema>
export type JobCreate = z.infer<typeof jobCreateSchema>
export type JobUpdate = z.infer<typeof jobUpdateSchema>
export type JobCustomerUpdate = z.infer<typeof jobCustomerUpdateSchema>
export type JobUpdateLog = z.infer<typeof jobUpdateLogSchema>
export type Lead = z.infer<typeof leads>
