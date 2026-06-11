import json
import uuid
from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import computed_field, EmailStr
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
    # customer
    customer_name: str | None = Field(default=None)
    customer_email: EmailStr | None = Field(default=None)
    customer_phone: str | None = Field(default=None)
    send_email_notification: bool = Field(default=False, nullable=False)


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
    lead_purchases: list["LeadPurchase"] = Relationship(
        back_populates="job",
        sa_relationship_kwargs={"cascade": "all, delete-orphan", "passive_deletes": True},
    )


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
    customer_name: str | None = None
    customer_email: EmailStr | None = None
    customer_phone: str | None = None
    send_email_notification: bool | None = None


class JobPublic(JobBase):
    id: uuid.UUID
    created_by_id: uuid.UUID
    created_at: datetime


class JobMarketplaceRedacted(SQLModel):
    # class JobMarketplaceRedacted(JobBase):
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
    urgency: Urgency
    # dropoff_location: str

    @computed_field
    @property
    def purchase_count(self) -> int:
        return len(self.lead_purchases) if self.lead_purchases else 0


class JobMarketplacePartial(JobMarketplaceRedacted):
    vehicle_class: VehicleClass
    vehicle_make_model: str
    is_drivable: bool


class JobMarketplaceFull(JobMarketplacePartial):
    vehicle_reg: str
    pickup_location: str
    pickup_area: str
    dropoff_location: str | None = None
    description: str | None = None
    customer_name: str | None = None
    customer_email: EmailStr | None = None
    customer_phone: str | None = None


# ── Customer-facing update (token-authenticated, no login required) ──


class JobCustomerUpdate(SQLModel):
    """Fields a customer can update via their edit-link token."""

    pickup_location: str | None = None
    dropoff_location: str | None = None
    description: str | None = None
    customer_name: str | None = None
    customer_phone: str | None = None


# ── Update log ────────────────────────────────────────────────────


class JobUpdateLog(SQLModel, table=True):
    __tablename__ = "jobupdatelog"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    job_id: uuid.UUID = Field(
        sa_column=sa.Column(
            sa.Uuid(),
            sa.ForeignKey("job.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        )
    )
    changed_by: str = Field(nullable=False)
    changes: str = Field(nullable=False)
    changed_at: datetime = Field(
        sa_column=sa.Column(
            sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        )
    )


class JobUpdateLogPublic(SQLModel):
    id: uuid.UUID
    job_id: uuid.UUID
    changed_by: str
    changes: dict[str, Any]
    changed_at: datetime

    @classmethod
    def from_orm_log(cls, log: "JobUpdateLog") -> "JobUpdateLogPublic":
        return cls(
            id=log.id,
            job_id=log.job_id,
            changed_by=log.changed_by,
            changes=json.loads(log.changes),
            changed_at=log.changed_at,
        )
