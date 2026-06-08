import * as z from "zod"

export const statusSchema = z.enum([
  "open",
  "purchased",
  "en_route",
  "completed",
])
export const statusLabels = {
  open: "Open",
  purchased: "Purchased",
  en_route: "En Route",
  completed: "Completed",
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
  id: z.string().uuid(),
  service_type: serviceTypeSchema,
  urgency: urgencySchema,
  status: statusSchema,
  created_at: z.string(),
  created_by_id: z.string().uuid(),
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
})

export const jobCreateSchema = z.object({
  service_type: serviceTypeSchema,
  urgency: urgencySchema,
  status: statusSchema.optional(),
  lead_price: z.number(),
  estimated_payout: z.number(),
  distance_miles: z.number(),
  vehicle_class: vehicleClassSchema,
  vehicle_make_model: z.string().min(1),
  vehicle_reg: z.string().min(1),
  is_drivable: z.boolean(),
  pickup_location: z.string().min(1),
  pickup_area: z.string().min(1),
  dropoff_location: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
})

export const jobUpdateSchema = jobCreateSchema.partial()

export type Job = z.infer<typeof jobSchema>
export type JobCreate = z.infer<typeof jobCreateSchema>
export type JobUpdate = z.infer<typeof jobUpdateSchema>
