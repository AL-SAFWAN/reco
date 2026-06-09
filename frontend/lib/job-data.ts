import {
  Job,
  serviceTypeSchema,
  vehicleClassSchema,
  urgencySchema,
} from "@/features/job/schema/jobSchema"

export type Status = Job["lead_status"]
export type ServiceType = Job["service_type"]
export type VehicleClass = Job["vehicle_class"]
export type Urgency = Job["urgency"]

export const SERVICE_TYPES: ServiceType[] = serviceTypeSchema.options

export const VEHICLE_CLASSES: VehicleClass[] = vehicleClassSchema.options

export const URGENCY_OPTIONS: Urgency[] = urgencySchema.options

export const AREAS = [
  "London",
  "Birmingham",
  "Manchester",
  "Bristol",
  "Leeds",
  "M25 / Motorway",
]
