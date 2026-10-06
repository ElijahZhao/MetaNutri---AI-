"""API tests for the import endpoint's input validation.

The DB session and the current user are overridden, so these run without a
database and without authentication. They cover the branches that previously
regressed: unsupported data types, oversized uploads, bad filenames and
malformed JSON.
"""

import pytest
from httpx import ASGITransport, AsyncClient

from app.core.security import get_current_active_user
from app.db.session import get_db
from app.main import app


class _FakeUser:
    id = "test-user-id"


class _FakeSession:
    """Minimal stand-in for AsyncSession: records adds, commits are a no-op."""

    def __init__(self):
        self.added = []

    def add(self, obj):
        self.added.append(obj)

    async def commit(self):
        return None


@pytest.fixture
async def client():
    async def _fake_user():
        return _FakeUser()

    async def _fake_db():
        yield _FakeSession()

    app.dependency_overrides[get_current_active_user] = _fake_user
    app.dependency_overrides[get_db] = _fake_db
    try:
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as async_client:
            yield async_client
    finally:
        app.dependency_overrides.clear()


async def test_rejects_unsupported_data_type(client):
    response = await client.post(
        "/api/import-export/import/not-a-type",
        files={"file": ("data.csv", b"a,b\n1,2\n", "text/csv")},
    )
    assert response.status_code == 400
    assert "Unsupported data type" in response.json()["detail"]


async def test_rejects_oversized_file(client):
    payload = b"gene_name\n" + b"x\n" * (6 * 1024 * 1024 // 2)
    response = await client.post(
        "/api/import-export/import/genomic",
        files={"file": ("data.csv", payload, "text/csv")},
    )
    assert response.status_code == 413


async def test_rejects_filename_without_extension(client):
    response = await client.post(
        "/api/import-export/import/genomic",
        files={"file": ("data", b"x", "text/plain")},
    )
    assert response.status_code == 400


async def test_rejects_unsupported_extension(client):
    response = await client.post(
        "/api/import-export/import/genomic",
        files={"file": ("data.txt", b"x", "text/plain")},
    )
    assert response.status_code == 400


async def test_rejects_malformed_json(client):
    response = await client.post(
        "/api/import-export/import/genomic",
        files={"file": ("data.json", b"{not json", "application/json")},
    )
    assert response.status_code == 400


async def test_imports_genomic_csv(client):
    csv = (
        b"gene_name,snp_id,genotype,effect_score,trait_description\n"
        b"FTO,rs9939609,AT,0.85,obesity risk\n"
    )
    response = await client.post(
        "/api/import-export/import/genomic",
        files={"file": ("data.csv", csv, "text/csv")},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "success"
    assert body["imported"] == 1
    assert body["errors"] == 0
