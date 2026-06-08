from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core import operations
from app.core.config import settings
from app.core.models import UserCreate
from app.modules.learning.content.curriculum.repository import (
    create_curriculum,
    update_curriculum,
)
from app.modules.learning.models import (
    CurriculumCreate,
    CurriculumStatus,
    CurriculumUpdate,
)


def test_admin_enroll_other_user(
    client: TestClient,
    superuser_token_headers: dict[str, str],
    db: Session,
) -> None:
    # Create another user
    user_in = UserCreate(email="other@example.com", password="password123")
    other_user = operations.create_user(session=db, user_create=user_in)

    # Create and publish curriculum
    curr = create_curriculum(db, CurriculumCreate(title="Test"))
    update_curriculum(db, curr, CurriculumUpdate(status=CurriculumStatus.PUBLISHED))

    data = {"curriculum_id": str(curr.id), "user_id": str(other_user.id)}
    response = client.post(
        f"{settings.API_V1_STR}/enrollments",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 200
    result = response.json()
    assert result["user_id"] == str(other_user.id)
    assert result["curriculum_id"] == str(curr.id)


def test_admin_get_enrollments_returns_only_own_records(
    client: TestClient,
    superuser_token_headers: dict[str, str],
    db: Session,
) -> None:
    user_in = UserCreate(email="list-other@example.com", password="password123")
    other_user = operations.create_user(session=db, user_create=user_in)

    curr = create_curriculum(db, CurriculumCreate(title="List Scope Test"))
    update_curriculum(db, curr, CurriculumUpdate(status=CurriculumStatus.PUBLISHED))

    own_enrollment_response = client.post(
        f"{settings.API_V1_STR}/enrollments",
        headers=superuser_token_headers,
        json={"curriculum_id": str(curr.id)},
    )
    assert own_enrollment_response.status_code == 200
    own_enrollment = own_enrollment_response.json()

    other_enrollment_response = client.post(
        f"{settings.API_V1_STR}/enrollments",
        headers=superuser_token_headers,
        json={"curriculum_id": str(curr.id), "user_id": str(other_user.id)},
    )
    assert other_enrollment_response.status_code == 200

    list_response = client.get(
        f"{settings.API_V1_STR}/enrollments",
        headers=superuser_token_headers,
        params={"curriculum_id": str(curr.id)},
    )
    assert list_response.status_code == 200

    result = list_response.json()
    assert len(result) == 1
    assert result[0]["id"] == own_enrollment["id"]
    assert result[0]["user_id"] == own_enrollment["user_id"]
