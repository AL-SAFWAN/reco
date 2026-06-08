import {
  Job,
  statusSchema,
  serviceTypeSchema,
  vehicleClassSchema,
  urgencySchema,
} from "@/features/job/schema/jobSchema"

export type Status = Job["status"]
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

export const JOBS: Job[] = [
  {
    id: "1",
    service_type: "Towing & Transport",
    urgency: "Immediate",
    status: "OPEN",
    created_at: "8 min ago",
    lead_price: 12,
    estimated_payout: 180,
    distance_miles: 6.2,
    vehicle_class: "Car",
    vehicle_make_model: "BMW 3 Series (2021)",
    vehicle_reg: "LM21 XKD",
    is_drivable: false,
    pickup_location: "A406 North Circular, Brent Cross",
    pickup_area: "London",
    dropoff_location: "Kwik Fit, Wembley HA9",
    description:
      "Customer's vehicle has suffered a complete engine failure and is immobile on the hard shoulder. Requires flatbed recovery to the nominated garage. Customer is waiting with the vehicle.",
  },
  {
    id: "2",
    service_type: "Jump Start",
    urgency: "Immediate",
    status: "EN_ROUTE",
    created_at: "21 min ago",
    lead_price: 5,
    estimated_payout: 55,
    distance_miles: 2.1,
    vehicle_class: "Car",
    vehicle_make_model: "Ford Fiesta (2018)",
    vehicle_reg: "BV18 RTO",
    is_drivable: true,
    pickup_location: "Tesco Extra Car Park, Stretford",
    pickup_area: "Manchester",
    dropoff_location: "On-site fix",
    description:
      "Flat battery after leaving interior lights on overnight. Vehicle is parked safely in a supermarket car park. Likely a simple jump start, possible battery replacement.",
  },
  {
    id: "3",
    service_type: "Winch / Recovery",
    urgency: "Scheduled",
    scheduled_time: "Today, 16:30",
    status: "COMPLETED",
    created_at: "1 hr ago",
    lead_price: 18,
    estimated_payout: 320,
    distance_miles: 14.8,
    vehicle_class: "Van",
    vehicle_make_model: "Mercedes Sprinter (2020)",
    vehicle_reg: "YK70 NHG",
    is_drivable: false,
    pickup_location: "Field access road off B6265",
    pickup_area: "Leeds",
    dropoff_location: "Fleet depot, Bradford BD4",
    description:
      "Fleet van has slid off a muddy access road and is stuck in a ditch. Requires winching out before recovery to the depot. Off-road capability essential.",
  },
  {
    id: "4",
    service_type: "EV Recovery",
    urgency: "Scheduled",
    status: "PURCHASED",
    created_at: "2 hrs ago",
    lead_price: 15,
    estimated_payout: 210,
    distance_miles: 9.4,
    vehicle_class: "EV",
    vehicle_make_model: "Tesla Model 3 (2022)",
    vehicle_reg: "EV22 TSL",
    is_drivable: false,
    pickup_location: "Gloucester Road Services, M5 J11",
    pickup_area: "Bristol",
    dropoff_location: "Tesla Service Centre, Bristol BS2",
    description:
      "EV with depleted battery and a suspected drive unit fault. Must be transported via flatbed only — towing with wheels on the ground is not permitted for this model.",
  },
  {
    id: "5",
    service_type: "Tyre Change",
    urgency: "Immediate",
    status: "PURCHASED",
    created_at: "3 hrs ago",
    lead_price: 5,
    estimated_payout: 65,
    distance_miles: 3.7,
    vehicle_class: "Car",
    vehicle_make_model: "Audi A4 (2019)",
    vehicle_reg: "RK19 ABN",
    is_drivable: false,
    pickup_location: "Aston Expressway A38(M)",
    pickup_area: "Birmingham",
    dropoff_location: "On-site fix",
    description:
      "Blowout on the front nearside tyre. No usable spare in the vehicle. Requires a mobile tyre fitter with the correct size in stock.",
  },
  {
    id: "6",
    service_type: "Accident Recovery",
    urgency: "Immediate",
    status: "OPEN",
    created_at: "4 hrs ago",
    lead_price: 22,
    estimated_payout: 480,
    distance_miles: 18.3,
    vehicle_class: "HGV / Truck",
    vehicle_make_model: "DAF LF (2017)",
    vehicle_reg: "DA17 FLF",
    is_drivable: false,
    pickup_location: "M25 Clockwise, J9–J10",
    pickup_area: "M25 / Motorway",
    dropoff_location: "Commercial recovery yard, Leatherhead",
    description:
      "Light goods truck involved in a low-speed collision. Front-end damage, not drivable. Requires heavy recovery and motorway incident handling in coordination with Highways.",
  },
]
