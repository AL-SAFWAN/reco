import uuid
from datetime import datetime
from enum import Enum

import sqlalchemy as sa
from sqlmodel import Field, SQLModel


class Status(str, Enum):
    open = "open"
    purchased = "purchased"
    en_route = "en_route"
    completed = "completed"


class ServiceType(str, Enum):
    towing_transport = "Towing & Transport"
    jump_start = "Jump Start"
    tyre_change = "Tyre Change"
    winch_recovery = "Winch / Recovery"
    fuel_delivery = "Fuel Delivery"
    ev_recovery = "EV Recovery"
    accident_recovery = "Accident Recovery"
    others = "Others"


class VehicleClass(str, Enum):
    car = "Car"
    van = "Van"
    motorcycle = "Motorcycle"
    hgv_truck = "HGV / Truck"
    ev = "EV"
    others = "Others"


class Urgency(str, Enum):
    immediate = "Immediate"
    scheduled = "Scheduled"


class JobBase(SQLModel):
    status: Status = Field(default=Status.open, nullable=False)
    service_type: ServiceType = Field(nullable=False)
    urgency: Urgency = Field(nullable=False)
    # values
    lead_price: float = Field(nullable=False)
    estimated_payout: float = Field(nullable=False)
    distance_miles: float = Field(nullable=False)
    # Vehicle
    vehicle_class: VehicleClass = Field(nullable=False)
    vehicle_make_model: str = Field(nullable=False)
    vehicle_reg: str = Field(nullable=False)
    is_drivable: bool = Field(nullable=False)
    # Location
    pickup_location: str = Field(nullable=False)
    pickup_area: str = Field(nullable=False)
    dropoff_location: str | None = None
    description: str | None = None


class Job(JobBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_by_id: uuid.UUID = Field(foreign_key="user.id", nullable=False)
    created_at: datetime | None = Field(
        sa_column=sa.Column(
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )


# ── Request / Response Schemas ──────────────────────────────────────


class JobCreate(JobBase):
    pass


class JobUpdate(SQLModel):
    status: Status | None = None
    service_type: ServiceType | None = None
    urgency: Urgency | None = None
    lead_price: float | None = None
    estimated_payout: float | None = None
    distance_miles: float | None = None
    vehicle_class: VehicleClass | None = None
    vehicle_make_model: str | None = None
    vehicle_reg: str | None = None
    is_drivable: bool | None = None
    pickup_location: str | None = None
    pickup_area: str | None = None
    dropoff_location: str | None = None
    description: str | None = None


class JobPublic(JobBase):
    id: uuid.UUID
    created_by_id: uuid.UUID
    created_at: datetime
