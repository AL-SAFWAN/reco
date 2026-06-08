import uuid

from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.config import settings
from app.modules.learning.content.curriculum.repository import (
    create_curriculum,
    update_curriculum,
)
from app.modules.learning.content.lesson.repository import (
    create_lesson,
)
from app.modules.learning.content.module.repository import (
    create_module,
)
from app.modules.learning.enrollment.repository import (
    create_enrollment,
)
from app.modules.learning.models import (
    CurriculumCreate,
    CurriculumStatus,
    CurriculumUpdate,
    LessonCreate,
    LessonStatus,
    ModuleCreate,
    ModuleStatus,
)
from app.modules.learning.progress.repository import (
    create_lesson_progress,
)
from app.modules.user.domain.models import UserCreate
from app.modules.user.infrastructure import repository as user_repository


def _create_user(
    db: Session, client: TestClient, email: str, password: str
) -> tuple[dict[str, str], uuid.UUID]:
    user = user_repository.create_user(
        session=db, user_in=UserCreate(email=email, password=password)
    )
    resp = client.post(
        f"{settings.API_V1_STR}/login/access-token",
        data={"username": email, "password": password},
    )
    token = resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    return headers, user.id


def _setup_curriculum(db: Session):
    curr = create_curriculum(db, CurriculumCreate(title="Count Test"))
    module = create_module(
        db,
        ModuleCreate(
            title="Module",
            curriculum_id=curr.id,
            status=ModuleStatus.PUBLISHED,
        ),
    )
    pub_lesson = create_lesson(
        db,
        LessonCreate(
            title="pub",
            module_id=module.id,
            status=LessonStatus.PUBLISHED,
        ),
    )
    create_lesson(
        db,
        LessonCreate(
            title="draft",
            module_id=module.id,
            status=LessonStatus.DRAFT,
        ),
    )
    update_curriculum(db, curr, CurriculumUpdate(status=CurriculumStatus.PUBLISHED))
    return curr, pub_lesson


def test_curriculum_detail_excludes_draft_lessons(
    client: TestClient, db: Session
) -> None:
    headers, user_id = _create_user(db, client, "detail@example.com", "password123")
    curr, pub_lesson = _setup_curriculum(db)
    enrollment = create_enrollment(db, user_id=user_id, curriculum_id=curr.id)
    create_lesson_progress(db, enrollment_id=enrollment.id, lesson_id=pub_lesson.id)

    resp = client.get(
        f"{settings.API_V1_STR}/curriculums/{curr.id}",
        headers=headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_lessons"] == 1
    assert data["completed_lessons"] == 1


def test_enrollment_summary_excludes_draft_lessons(
    client: TestClient, db: Session
) -> None:
    headers, user_id = _create_user(db, client, "summary@example.com", "password123")
    curr, pub_lesson = _setup_curriculum(db)
    enrollment = create_enrollment(db, user_id=user_id, curriculum_id=curr.id)
    create_lesson_progress(db, enrollment_id=enrollment.id, lesson_id=pub_lesson.id)

    resp = client.get(
        f"{settings.API_V1_STR}/enrollments/summary",
        params={"curriculum_id": str(curr.id)},
        headers=headers,
    )
    assert resp.status_code == 200
    data = resp.json()[0]
    assert data["total_lessons"] == 1
    assert data["completed_lessons"] == 1
