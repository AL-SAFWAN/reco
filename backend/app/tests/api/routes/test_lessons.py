import uuid

from fastapi.testclient import TestClient
from sqlmodel import Session, select

from app.core.config import settings
from app.modules.discipline.domain.models import (
    DisciplineCreate,
    DisciplineVersion,
    Technique,
    TechniqueCreate,
    TechniqueSemantics,
)
from app.modules.discipline.infrastructure.crud_repository import (
    create_discipline,
    create_technique,
)
from app.modules.learning.content.curriculum.repository import (
    create_curriculum,
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
    LessonCreate,
    LessonType,
    ModuleCreate,
)
from app.modules.learning.progress.repository import (
    create_lesson_progress,
    list_lesson_progress,
)
from app.modules.user.domain.models import UserCreate
from app.modules.user.infrastructure import repository as user_repository
from app.modules.video.domain.watch_models import VideoWatchEvent, VideoWatchSession


def setup_module_with_curriculum(db: Session):
    curr = create_curriculum(db, CurriculumCreate(title="Test curriculum"))
    mod = create_module(db, ModuleCreate(title="Mod", curriculum_id=curr.id))
    return curr, mod


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


def test_create_lesson_with_youtube_url(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    _, mod = setup_module_with_curriculum(db)
    data = {
        "title": "Video Lesson",
        "module_id": str(mod.id),
        "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    }
    response = client.post(
        f"{settings.API_V1_STR}/lessons",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 200
    result = response.json()
    assert result["youtube_url"] == data["youtube_url"]


def test_update_lesson_youtube_url(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    _, mod = setup_module_with_curriculum(db)
    lesson = create_lesson(db, LessonCreate(title="L", module_id=mod.id))
    new_url = "https://www.youtube.com/watch?v=abcdef"
    response = client.patch(
        f"{settings.API_V1_STR}/lessons/{lesson.id}",
        headers=superuser_token_headers,
        json={"youtube_url": new_url},
    )
    assert response.status_code == 200
    result = response.json()
    assert result["youtube_url"] == new_url


def test_delete_lesson_removes_progress(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    curr, mod = setup_module_with_curriculum(db)
    lesson = create_lesson(db, LessonCreate(title="L", module_id=mod.id))
    # create user and enrollment
    user = user_repository.create_user(
        session=db, user_in=UserCreate(email="del@example.com", password="pass1234")
    )
    enrollment = create_enrollment(db, user_id=user.id, curriculum_id=curr.id)
    create_lesson_progress(db, enrollment_id=enrollment.id, lesson_id=lesson.id)

    resp = client.delete(
        f"{settings.API_V1_STR}/lessons/{lesson.id}",
        headers=superuser_token_headers,
    )
    assert resp.status_code == 200
    progress = list_lesson_progress(db, enrollment_id=enrollment.id)
    assert progress == []


def test_delete_lesson_removes_watch_rows_and_linked_technique(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    _, mod = setup_module_with_curriculum(db)
    lesson = create_lesson(db, LessonCreate(title="Video lesson", module_id=mod.id))
    discipline = create_discipline(db, build_discipline("BJJ"))
    create_technique(
        db,
        TechniqueCreate(
            discipline_id=discipline.id,
            name="Technique",
            semantics=TechniqueSemantics(),
            lesson_id=lesson.id,
        ),
    )

    user = user_repository.create_user(
        session=db, user_in=UserCreate(email="watch@example.com", password="pass1234")
    )
    session_id = uuid.uuid4()
    db.add(
        VideoWatchEvent(
            event_id=uuid.uuid4(),
            session_id=session_id,
            sequence_no=1,
            user_id=user.id,
            lesson_id=lesson.id,
            event_type="started",
            playhead_ms=0,
            watch_duration_ms=1000,
            total_duration_ms=10000,
            watched_percent=10.0,
            source="youtube",
            client_time_ms=1,
        )
    )
    db.add(
        VideoWatchSession(
            session_id=session_id,
            user_id=user.id,
            lesson_id=lesson.id,
            source="youtube",
            max_percent=10.0,
            watched_ms=1000,
            completed=False,
            seek_count=0,
            wait_count=0,
        )
    )
    db.commit()

    resp = client.delete(
        f"{settings.API_V1_STR}/lessons/{lesson.id}",
        headers=superuser_token_headers,
    )

    assert resp.status_code == 200
    assert db.get(VideoWatchSession, session_id) is None
    assert (
        db.exec(
            select(VideoWatchEvent).where(VideoWatchEvent.lesson_id == lesson.id)
        ).all()
        == []
    )
    assert (
        db.exec(
            select(VideoWatchEvent).where(VideoWatchEvent.session_id == session_id)
        ).all()
        == []
    )
    assert db.exec(select(Technique).where(Technique.lesson_id == lesson.id)).all() == []


def test_publish_video_requires_upload(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    _, mod = setup_module_with_curriculum(db)
    lesson = create_lesson(
        db,
        LessonCreate(title="Video", module_id=mod.id, lesson_type=LessonType.VIDEO),
    )
    resp = client.patch(
        f"{settings.API_V1_STR}/lessons/{lesson.id}",
        headers=superuser_token_headers,
        json={"status": "published"},
    )
    assert resp.status_code == 400


def test_publish_video_allows_missing_description(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    _, mod = setup_module_with_curriculum(db)
    lesson = create_lesson(
        db,
        LessonCreate(
            title="Video",
            module_id=mod.id,
            lesson_type=LessonType.VIDEO,
            youtube_url="https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            description=None,
        ),
    )
    resp = client.patch(
        f"{settings.API_V1_STR}/lessons/{lesson.id}",
        headers=superuser_token_headers,
        json={"status": "published"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "published"


def test_clearing_published_lesson_description_keeps_lesson_published(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    _, mod = setup_module_with_curriculum(db)
    lesson = create_lesson(
        db,
        LessonCreate(
            title="Video",
            description="<p>Ready to publish</p>",
            module_id=mod.id,
            lesson_type=LessonType.VIDEO,
            youtube_url="https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        ),
    )
    publish_resp = client.patch(
        f"{settings.API_V1_STR}/lessons/{lesson.id}",
        headers=superuser_token_headers,
        json={"status": "published"},
    )
    assert publish_resp.status_code == 200

    clear_resp = client.patch(
        f"{settings.API_V1_STR}/lessons/{lesson.id}",
        headers=superuser_token_headers,
        json={"description": None},
    )
    assert clear_resp.status_code == 200
    assert clear_resp.json()["status"] == "published"


def test_clearing_published_lesson_title_auto_drafts_lesson(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    _, mod = setup_module_with_curriculum(db)
    lesson = create_lesson(
        db,
        LessonCreate(
            title="Video",
            description="<p>Ready to publish</p>",
            module_id=mod.id,
            lesson_type=LessonType.VIDEO,
            youtube_url="https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        ),
    )
    publish_resp = client.patch(
        f"{settings.API_V1_STR}/lessons/{lesson.id}",
        headers=superuser_token_headers,
        json={"status": "published"},
    )
    assert publish_resp.status_code == 200

    clear_resp = client.patch(
        f"{settings.API_V1_STR}/lessons/{lesson.id}",
        headers=superuser_token_headers,
        json={"title": ""},
    )
    assert clear_resp.status_code == 200
    assert clear_resp.json()["status"] == "draft"
