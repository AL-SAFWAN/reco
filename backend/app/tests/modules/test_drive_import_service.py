import pytest

from app.modules.video.domain import drive_import_service as service


class _OkResponse:
    def raise_for_status(self) -> None:
        return None


class _FakeDriveResponse:
    def __init__(self, chunks: list[bytes]) -> None:
        self._chunks = chunks

    def __enter__(self) -> "_FakeDriveResponse":
        return self

    def __exit__(self, exc_type, exc, tb) -> None:
        return None

    def raise_for_status(self) -> None:
        return None

    def iter_bytes(self, chunk_size: int):
        del chunk_size
        yield from self._chunks


class _FakeClient:
    def __init__(self, chunks: list[bytes]) -> None:
        self._chunks = chunks
        self.patch_calls: list[dict[str, str | bytes]] = []
        self.stream_calls: list[dict[str, str | dict[str, str]]] = []

    def __enter__(self) -> "_FakeClient":
        return self

    def __exit__(self, exc_type, exc, tb) -> None:
        return None

    def stream(
        self, method: str, url: str, headers: dict[str, str]
    ) -> _FakeDriveResponse:
        self.stream_calls.append({"method": method, "url": url, "headers": headers})
        return _FakeDriveResponse(self._chunks)

    def patch(
        self, location: str, headers: dict[str, str], content: bytes
    ) -> _OkResponse:
        self.patch_calls.append(
            {"location": location, "headers": headers, "content": content}
        )
        return _OkResponse()


def test_import_from_google_drive_streams_chunks_and_flushes_remainder(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    fake_client = _FakeClient([b"abc", b"defg", b"h"])

    monkeypatch.setattr(service, "CHUNK_SIZE", 5)
    monkeypatch.setattr(
        service,
        "_initiate_cf_tus",
        lambda file_size, file_name: ("https://cf.example/upload", "media-123"),
    )
    monkeypatch.setattr(service.httpx, "Client", lambda *args, **kwargs: fake_client)

    result = service.import_from_google_drive(
        access_token="token",
        file_id="drive-file",
        file_name="lesson.mp4",
        file_size=8,
    )

    assert result == {"cf_uid": "media-123"}
    assert fake_client.stream_calls == [
        {
            "method": "GET",
            "url": "https://www.googleapis.com/drive/v3/files/drive-file?alt=media",
            "headers": {"Authorization": "Bearer token"},
        }
    ]
    assert fake_client.patch_calls == [
        {
            "location": "https://cf.example/upload",
            "headers": {
                "Tus-Resumable": "1.0.0",
                "Upload-Offset": "0",
                "Content-Type": "application/offset+octet-stream",
                "Content-Length": "5",
            },
            "content": b"abcde",
        },
        {
            "location": "https://cf.example/upload",
            "headers": {
                "Tus-Resumable": "1.0.0",
                "Upload-Offset": "5",
                "Content-Type": "application/offset+octet-stream",
                "Content-Length": "3",
            },
            "content": b"fgh",
        },
    ]
