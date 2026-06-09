import uuid
from datetime import datetime
from enum import Enum

from pydantic import computed_field
import sqlalchemy as sa
from sqlmodel import Field, SQLModel, Relationship

from app.modules.marketplace.domain.models import LeadPurchase, LeadPurchasePublic


class LeadStatus(str, Enum):
    open = "open"
    partial = "partial"
    closed = "closed"


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
    lead_status: LeadStatus = Field(default=LeadStatus.open, nullable=False)
    max_buyers: int = Field(default=3, nullable=False)
    closed_at: datetime | None = Field(
        default=None, sa_column=sa.Column(sa.DateTime(timezone=True), nullable=True)
    )
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
    lead_purchases: list["LeadPurchase"] = Relationship(back_populates="job")


# ── Request / Response Schemas ──────────────────────────────────────


class JobCreate(JobBase):
    pass


class JobUpdate(SQLModel):
    lead_status: LeadStatus | None = None
    closed_at: datetime | None = None
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


class JobMarketplaceRedacted(SQLModel):
    id: uuid.UUID
    # created_by_id: uuid.UUID
    created_at: datetime
    purchased: bool = False
    # TODO remove the after getting the count
    lead_purchases: list[LeadPurchasePublic] = []
    # pickup_area: str
    lead_status: LeadStatus
    service_type: ServiceType
    lead_price: float
    estimated_payout: float
    max_buyers: int
    # dropoff_location: str

    @computed_field
    @property
    def purchase_count(self) -> int:
        return len(self.lead_purchases) if self.lead_purchases else 0
