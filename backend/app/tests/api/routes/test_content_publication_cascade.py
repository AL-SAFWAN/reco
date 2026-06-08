from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.config import settings
from app.modules.learning.content.curriculum.repository import (
    create_curriculum,
    get_curriculum,
    update_curriculum,
)
from app.modules.learning.content.lesson.repository import (
    create_lesson,
    get_lesson,
    update_lesson,
)
from app.modules.learning.content.module.repository import (
    create_module,
    get_module,
    update_module,
)
from app.modules.learning.models import (
    CurriculumCreate,
    CurriculumStatus,
    CurriculumUpdate,
    LessonCreate,
    LessonStatus,
    LessonUpdate,
    ModuleCreate,
    ModuleStatus,
    ModuleUpdate,
)


def test_unlinking_last_published_lesson_drafts_module_and_curriculum(
    client: TestClient,
    superuser_token_headers: dict[str, str],
    db: Session,
) -> None:
    curriculum = create_curriculum(db, CurriculumCreate(title="Curriculum"))
    module = create_module(
        db, ModuleCreate(title="Module", curriculum_id=curriculum.id)
    )
    lesson = create_lesson(db, LessonCreate(title="Lesson", module_id=module.id))

    update_lesson(db, lesson, LessonUpdate(status=LessonStatus.PUBLISHED))
    update_module(db, module, ModuleUpdate(status=ModuleStatus.PUBLISHED))
    update_curriculum(
        db,
        curriculum,
        CurriculumUpdate(status=CurriculumStatus.PUBLISHED),
    )

    response = client.patch(
        f"{settings.API_V1_STR}/lessons/{lesson.id}",
        headers=superuser_token_headers,
        json={"module_id": None},
    )

    assert response.status_code == 200

    db_module = get_module(db, module.id)
    db_curriculum = get_curriculum(db, curriculum.id)
    db_lesson = get_lesson(db, lesson.id)

    assert db_lesson is not None
    assert db_lesson.module_id is None
    assert db_module is not None
    assert db_module.status == ModuleStatus.DRAFT
    assert db_curriculum is not None
    assert db_curriculum.status == CurriculumStatus.DRAFT


def test_unlinking_last_published_module_drafts_curriculum(
    client: TestClient,
    superuser_token_headers: dict[str, str],
    db: Session,
) -> None:
    curriculum = create_curriculum(db, CurriculumCreate(title="Curriculum"))
    module = create_module(
        db, ModuleCreate(title="Module", curriculum_id=curriculum.id)
    )
    lesson = create_lesson(db, LessonCreate(title="Lesson", module_id=module.id))

    update_lesson(db, lesson, LessonUpdate(status=LessonStatus.PUBLISHED))
    update_module(db, module, ModuleUpdate(status=ModuleStatus.PUBLISHED))
    update_curriculum(
        db,
        curriculum,
        CurriculumUpdate(status=CurriculumStatus.PUBLISHED),
    )

    response = client.patch(
        f"{settings.API_V1_STR}/modules/{module.id}",
        headers=superuser_token_headers,
        json={"curriculum_id": None},
    )

    assert response.status_code == 200

    db_module = get_module(db, module.id)
    db_curriculum = get_curriculum(db, curriculum.id)

    assert db_module is not None
    assert db_module.curriculum_id is None
    assert db_curriculum is not None
    assert db_curriculum.status == CurriculumStatus.DRAFT
