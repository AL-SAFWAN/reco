import asyncio
from datetime import datetime, timedelta, timezone
from types import SimpleNamespace

import pytest
import stripe
from fastapi import HTTPException

from app.modules.billing.domain import service
from app.modules.billing.domain.models import (
    BillingSubscription,
    BillingWebhookProcessingStatus,
)
from app.modules.billing.domain.policy import (
    AccessDecision,
    decide_paid_curriculum_access,
)
from app.modules.billing.infrastructure import routes


class DummyRequest:
    def __init__(self, payload: bytes = b"{}") -> None:
        self._payload = payload

    async def body(self) -> bytes:
        return self._payload


class DummySession:
    def __init__(self) -> None:
        self.rolled_back = False

    def rollback(self) -> None:
        self.rolled_back = True


def _run(coro):
    return asyncio.run(coro)


def test_webhook_invalid_signature_or_payload_returns_400(
    monkeypatch: pytest.MonkeyPatch,
):
    monkeypatch.setattr(routes.settings, "STRIPE_WEBHOOK_SECRET", "whsec_test")
    monkeypatch.setattr(
        stripe.Webhook,
        "construct_event",
        lambda payload, sig_header, secret: (_ for _ in ()).throw(
            ValueError("bad payload")
        ),
    )

    with pytest.raises(HTTPException) as exc:
        _run(
            routes.stripe_webhook(
                request=DummyRequest(),
                session=DummySession(),
                stripe_signature="sig",
            )
        )

    assert exc.value.status_code == 400


def test_webhook_persistence_failure_returns_500(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setattr(routes.settings, "STRIPE_WEBHOOK_SECRET", "whsec_test")
    monkeypatch.setattr(
        stripe.Webhook,
        "construct_event",
        lambda payload, sig_header, secret: {
            "id": "evt_1",
            "type": "invoice.created",
            "livemode": False,
            "created": int(datetime.now(timezone.utc).timestamp()),
        },
    )
    monkeypatch.setattr(
        routes.repository,
        "save_webhook_event_if_new",
        lambda *args, **kwargs: (_ for _ in ()).throw(RuntimeError("db down")),
    )

    session = DummySession()
    with pytest.raises(HTTPException) as exc:
        _run(
            routes.stripe_webhook(
                request=DummyRequest(),
                session=session,
                stripe_signature="sig",
            )
        )

    assert exc.value.status_code == 500
    assert session.rolled_back is True


def test_webhook_duplicate_event_returns_200_idempotent(
    monkeypatch: pytest.MonkeyPatch,
):
    monkeypatch.setattr(routes.settings, "STRIPE_WEBHOOK_SECRET", "whsec_test")
    monkeypatch.setattr(
        stripe.Webhook,
        "construct_event",
        lambda payload, sig_header, secret: {
            "id": "evt_dup",
            "type": "invoice.created",
            "livemode": False,
            "created": int(datetime.now(timezone.utc).timestamp()),
        },
    )
    monkeypatch.setattr(
        routes.repository,
        "save_webhook_event_if_new",
        lambda *args, **kwargs: (None, True),
    )

    result = _run(
        routes.stripe_webhook(
            request=DummyRequest(),
            session=DummySession(),
            stripe_signature="sig",
        )
    )
    assert result == {"ok": True, "idempotent": True}


def test_webhook_processing_failure_returns_200_and_not_crash(
    monkeypatch: pytest.MonkeyPatch,
):
    monkeypatch.setattr(routes.settings, "STRIPE_WEBHOOK_SECRET", "whsec_test")
    monkeypatch.setattr(
        stripe.Webhook,
        "construct_event",
        lambda payload, sig_header, secret: {
            "id": "evt_fail",
            "type": "invoice.created",
            "livemode": False,
            "created": int(datetime.now(timezone.utc).timestamp()),
        },
    )
    event = SimpleNamespace(
        stripe_event_id="evt_fail",
        retry_count=0,
        payload_json={},
        processing_status=BillingWebhookProcessingStatus.RECEIVED,
    )
    monkeypatch.setattr(
        routes.repository,
        "save_webhook_event_if_new",
        lambda *args, **kwargs: (event, False),
    )
    monkeypatch.setattr(
        routes.service,
        "process_webhook_event_record",
        lambda *args, **kwargs: (_ for _ in ()).throw(
            RuntimeError("processing failed")
        ),
    )

    result = _run(
        routes.stripe_webhook(
            request=DummyRequest(),
            session=DummySession(),
            stripe_signature="sig",
        )
    )
    assert result == {"ok": True, "accepted": True, "processed": False}


def test_policy_probe_safe_and_paywall_decisions():
    assert (
        decide_paid_curriculum_access(
            curriculum_exists=True,
            curriculum_published=True,
            curriculum_is_paid=True,
            is_enrolled=False,
            has_paid_entitlement=False,
            is_admin=False,
        )
        == AccessDecision.NOT_FOUND
    )
    assert (
        decide_paid_curriculum_access(
            curriculum_exists=True,
            curriculum_published=True,
            curriculum_is_paid=True,
            is_enrolled=True,
            has_paid_entitlement=False,
            is_admin=False,
        )
        == AccessDecision.PAYWALLED
    )
    assert (
        decide_paid_curriculum_access(
            curriculum_exists=True,
            curriculum_published=True,
            curriculum_is_paid=True,
            is_enrolled=True,
            has_paid_entitlement=True,
            is_admin=False,
        )
        == AccessDecision.ALLOW
    )


def test_entitlement_grace_window_behavior():
    now = datetime.now(timezone.utc)
    active = BillingSubscription(
        user_id="00000000-0000-0000-0000-000000000001",
        stripe_subscription_id="sub_active",
        stripe_status="active",
    )
    past_due_in_grace = BillingSubscription(
        user_id="00000000-0000-0000-0000-000000000002",
        stripe_subscription_id="sub_grace",
        stripe_status="past_due",
        grace_expires_at=now + timedelta(days=1),
    )
    past_due_expired = BillingSubscription(
        user_id="00000000-0000-0000-0000-000000000003",
        stripe_subscription_id="sub_expired",
        stripe_status="past_due",
        grace_expires_at=now - timedelta(minutes=1),
    )
    unpaid = BillingSubscription(
        user_id="00000000-0000-0000-0000-000000000004",
        stripe_subscription_id="sub_unpaid",
        stripe_status="unpaid",
    )

    assert service.is_subscription_entitled(active) is True
    assert service.is_subscription_entitled(past_due_in_grace) is True
    assert service.is_subscription_entitled(past_due_expired) is False
    assert service.is_subscription_entitled(unpaid) is False


def test_processing_marks_dead_letter_when_max_retries_reached(
    monkeypatch: pytest.MonkeyPatch,
):
    event = SimpleNamespace(
        stripe_event_id="evt_dead",
        retry_count=2,
        payload_json={"id": "evt_dead", "type": "invoice.created"},
        processing_status=BillingWebhookProcessingStatus.RECEIVED,
    )
    calls: dict[str, int] = {"dead": 0, "failed": 0}

    monkeypatch.setattr(service.settings, "BILLING_WORKER_MAX_RETRIES", 3)
    monkeypatch.setattr(
        service.repository, "mark_webhook_processing", lambda *args, **kwargs: None
    )
    monkeypatch.setattr(
        service,
        "process_stripe_event_payload",
        lambda *args, **kwargs: (_ for _ in ()).throw(RuntimeError("boom")),
    )
    monkeypatch.setattr(
        service.repository,
        "mark_webhook_dead_letter",
        lambda *args, **kwargs: calls.__setitem__("dead", calls["dead"] + 1),
    )
    monkeypatch.setattr(
        service.repository,
        "mark_webhook_failed",
        lambda *args, **kwargs: calls.__setitem__("failed", calls["failed"] + 1),
    )

    with pytest.raises(RuntimeError):
        service.process_webhook_event_record(SimpleNamespace(), event)

    assert calls["dead"] == 1
    assert calls["failed"] == 0


def test_list_student_invoices_maps_fields_and_capabilities(
    monkeypatch: pytest.MonkeyPatch,
):
    invoice_row = SimpleNamespace(
        stripe_invoice_id="in_123",
        invoice_number="INV-2026-0001",
        status="paid",
        amount_due=2900,
        amount_paid=2900,
        currency="usd",
        created_at=datetime.now(timezone.utc),
        hosted_invoice_url="https://example.com/open",
        invoice_pdf="https://example.com/pdf",
    )
    monkeypatch.setattr(
        service.repository,
        "list_user_invoices_limited",
        lambda *_args, **_kwargs: [invoice_row],
    )

    invoices = service.list_student_invoices(
        SimpleNamespace(),
        user_id="00000000-0000-0000-0000-000000000001",
        limit=10,
    )

    assert len(invoices) == 1
    invoice = invoices[0]
    assert invoice.stripe_invoice_id == "in_123"
    assert invoice.invoice_number == "INV-2026-0001"
    assert invoice.amount_due_minor == 2900
    assert invoice.amount_paid_minor == 2900
    assert invoice.can_open is True
    assert invoice.can_download_pdf is True


def test_list_billing_invoices_passes_limit_to_service(monkeypatch: pytest.MonkeyPatch):
    calls: dict[str, int] = {}
    monkeypatch.setattr(
        routes.service,
        "list_student_invoices",
        lambda _session, *, user_id, limit: calls.__setitem__("limit", limit) or [],
    )

    result = routes.list_billing_invoices(
        session=DummySession(),
        current_user=SimpleNamespace(id="00000000-0000-0000-0000-000000000001"),
        limit=25,
    )

    assert result == []
    assert calls["limit"] == 25


def test_open_invoice_redirect_returns_303_and_no_store_headers(
    monkeypatch: pytest.MonkeyPatch,
):
    invoice = SimpleNamespace(
        hosted_invoice_url="https://example.com/invoice/open",
        invoice_pdf="https://example.com/invoice/pdf",
    )
    monkeypatch.setattr(
        routes.repository,
        "get_user_invoice_by_stripe_id",
        lambda *args, **kwargs: invoice,
    )

    response = routes.open_billing_invoice(
        stripe_invoice_id="in_open",
        session=DummySession(),
        current_user=SimpleNamespace(id="00000000-0000-0000-0000-000000000001"),
    )

    assert response.status_code == 303
    assert response.headers["location"] == "https://example.com/invoice/open"
    assert response.headers["Cache-Control"] == "no-store"
    assert response.headers["Pragma"] == "no-cache"


def test_open_invoice_not_ready_returns_409_with_expected_code(
    monkeypatch: pytest.MonkeyPatch,
):
    invoice = SimpleNamespace(hosted_invoice_url=None, invoice_pdf=None)
    monkeypatch.setattr(
        routes.repository,
        "get_user_invoice_by_stripe_id",
        lambda *args, **kwargs: invoice,
    )

    with pytest.raises(HTTPException) as exc:
        routes.open_billing_invoice(
            stripe_invoice_id="in_not_ready",
            session=DummySession(),
            current_user=SimpleNamespace(id="00000000-0000-0000-0000-000000000001"),
        )

    assert exc.value.status_code == 409
    assert exc.value.detail["code"] == "INVOICE_URL_NOT_READY"


def test_open_invoice_not_owned_returns_404(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setattr(
        routes.repository,
        "get_user_invoice_by_stripe_id",
        lambda *args, **kwargs: None,
    )

    with pytest.raises(HTTPException) as exc:
        routes.open_billing_invoice(
            stripe_invoice_id="in_missing",
            session=DummySession(),
            current_user=SimpleNamespace(id="00000000-0000-0000-0000-000000000001"),
        )

    assert exc.value.status_code == 404


def test_pdf_invoice_redirect_returns_303_and_no_store_headers(
    monkeypatch: pytest.MonkeyPatch,
):
    invoice = SimpleNamespace(
        hosted_invoice_url="https://example.com/invoice/open",
        invoice_pdf="https://example.com/invoice/pdf",
    )
    monkeypatch.setattr(
        routes.repository,
        "get_user_invoice_by_stripe_id",
        lambda *args, **kwargs: invoice,
    )

    response = routes.download_billing_invoice_pdf(
        stripe_invoice_id="in_pdf",
        session=DummySession(),
        current_user=SimpleNamespace(id="00000000-0000-0000-0000-000000000001"),
    )

    assert response.status_code == 303
    assert response.headers["location"] == "https://example.com/invoice/pdf"
    assert response.headers["Cache-Control"] == "no-store"
    assert response.headers["Pragma"] == "no-cache"


def test_pdf_invoice_not_ready_returns_409_with_expected_code(
    monkeypatch: pytest.MonkeyPatch,
):
    invoice = SimpleNamespace(hosted_invoice_url=None, invoice_pdf=None)
    monkeypatch.setattr(
        routes.repository,
        "get_user_invoice_by_stripe_id",
        lambda *args, **kwargs: invoice,
    )

    with pytest.raises(HTTPException) as exc:
        routes.download_billing_invoice_pdf(
            stripe_invoice_id="in_pdf_not_ready",
            session=DummySession(),
            current_user=SimpleNamespace(id="00000000-0000-0000-0000-000000000001"),
        )

    assert exc.value.status_code == 409
    assert exc.value.detail["code"] == "INVOICE_PDF_NOT_READY"


def test_pdf_invoice_not_owned_returns_404(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setattr(
        routes.repository,
        "get_user_invoice_by_stripe_id",
        lambda *args, **kwargs: None,
    )

    with pytest.raises(HTTPException) as exc:
        routes.download_billing_invoice_pdf(
            stripe_invoice_id="in_pdf_missing",
            session=DummySession(),
            current_user=SimpleNamespace(id="00000000-0000-0000-0000-000000000001"),
        )

    assert exc.value.status_code == 404


def test_sync_invoice_stores_invoice_number(monkeypatch: pytest.MonkeyPatch):
    stripe_invoice = {
        "id": "in_sync_1",
        "customer": "cus_123",
        "subscription": None,
        "number": "INV-2026-0020",
        "status": "paid",
        "amount_due": 1900,
        "amount_paid": 1900,
        "currency": "usd",
        "hosted_invoice_url": "https://example.com/open",
        "invoice_pdf": "https://example.com/pdf",
        "created": int(datetime.now(timezone.utc).timestamp()),
    }
    captured: dict[str, object] = {}

    monkeypatch.setattr(service, "_configure_stripe", lambda: None)
    monkeypatch.setattr(stripe.Invoice, "retrieve", lambda _invoice_id: stripe_invoice)
    monkeypatch.setattr(
        service,
        "_resolve_user_from_customer",
        lambda *_args, **_kwargs: SimpleNamespace(
            id="00000000-0000-0000-0000-000000000001"
        ),
    )
    monkeypatch.setattr(
        service.repository,
        "upsert_invoice",
        lambda *_args, **kwargs: captured.update(kwargs) or SimpleNamespace(),
    )

    service._sync_invoice_from_id(
        SimpleNamespace(),
        stripe_invoice_id="in_sync_1",
    )

    assert captured["invoice_number"] == "INV-2026-0020"
