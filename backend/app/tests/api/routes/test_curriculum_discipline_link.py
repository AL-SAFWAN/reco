from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.config import settings
from app.modules.discipline.domain.models import (
    DisciplineCreate,
    DisciplineVersion,
    TechniqueCreate,
    TechniqueSemantics,
)
from app.modules.discipline.infrastructure.crud_repository import (
    create_discipline,
    create_technique,
)
from app.modules.learning.content.curriculum.repository import (
    create_curriculum,
    get_curriculum,
)
from app.modules.learning.content.lesson.repository import create_lesson
from app.modules.learning.content.module.repository import create_module
from app.modules.learning.models import CurriculumCreate, LessonCreate, ModuleCreate


def build_discipline(name: str) -> DisciplineCreate:
    return DisciplineCreate(
        name=name,
        sport="grappling",
        description=f"{name} discipline",
        current_version=DisciplineVersion(
            id=f"{name.lower()}-v1",
            effective_date="2026-01-01",
            created_at="2026-01-01T00:00:00Z",
        ),
    )


def test_admin_can_set_curriculum_discipline(
    client: TestClient,
    superuser_token_headers: dict[str, str],
    db: Session,
) -> None:
    discipline = create_discipline(db, build_discipline("BJJ"))
    curriculum = create_curriculum(db, CurriculumCreate(title="Curriculum"))

    response = client.patch(
        f"{settings.API_V1_STR}/curriculums/{curriculum.id}",
        headers=superuser_token_headers,
        json={"discipline_id": str(discipline.id)},
    )

    assert response.status_code == 200
    assert response.json()["discipline_id"] == str(discipline.id)

    db_curriculum = get_curriculum(db, curriculum.id)
    assert db_curriculum is not None
    assert db_curriculum.discipline_id == discipline.id


def test_cannot_change_curriculum_discipline_after_technique_setup_exists(
    client: TestClient,
    superuser_token_headers: dict[str, str],
    db: Session,
) -> None:
    first_discipline = create_discipline(db, build_discipline("BJJ"))
    second_discipline = create_discipline(db, build_discipline("Judo"))
    curriculum = create_curriculum(
        db,
        CurriculumCreate(
            title="Curriculum",
            discipline_id=first_discipline.id,
        ),
    )
    module = create_module(
        db,
        ModuleCreate(title="Module", curriculum_id=curriculum.id),
    )
    lesson = create_lesson(
        db,
        LessonCreate(title="Lesson", module_id=module.id),
    )
    create_technique(
        db,
        TechniqueCreate(
            discipline_id=first_discipline.id,
            name="Linked technique",
            semantics=TechniqueSemantics(),
            lesson_id=lesson.id,
        ),
    )

    response = client.patch(
        f"{settings.API_V1_STR}/curriculums/{curriculum.id}",
        headers=superuser_token_headers,
        json={"discipline_id": str(second_discipline.id)},
    )

    assert response.status_code == 400
    assert (
        response.json()["detail"]
        == "Cannot change curriculum discipline after lesson technique setup has been created"
    )
