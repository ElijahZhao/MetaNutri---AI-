"""Unit tests for app.core.security — password hashing and JWT handling."""

from datetime import timedelta

from app.core.security import (
    ACCESS_TOKEN_TYPE,
    REFRESH_TOKEN_TYPE,
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    verify_password,
)


def test_password_hash_roundtrip():
    hashed = get_password_hash("secret123")
    assert hashed != "secret123"
    assert verify_password("secret123", hashed)
    assert not verify_password("secret124", hashed)


def test_access_token_roundtrip():
    token = create_access_token({"sub": "user-1"})
    payload = decode_token(token, ACCESS_TOKEN_TYPE)
    assert payload is not None
    assert payload["sub"] == "user-1"


def test_token_type_is_enforced():
    access = create_access_token({"sub": "user-1"})
    refresh = create_refresh_token({"sub": "user-1"})
    # A refresh token must not be usable as an access token, and vice versa.
    assert decode_token(access, REFRESH_TOKEN_TYPE) is None
    assert decode_token(refresh, ACCESS_TOKEN_TYPE) is None
    assert decode_token(refresh, REFRESH_TOKEN_TYPE)["sub"] == "user-1"


def test_decode_requires_a_subject():
    token = create_access_token({"scope": "read"})
    assert decode_token(token, ACCESS_TOKEN_TYPE) is None


def test_tampered_token_is_rejected():
    token = create_access_token({"sub": "user-1"})
    assert decode_token(token + "x", ACCESS_TOKEN_TYPE) is None


def test_expired_token_is_rejected():
    token = create_access_token({"sub": "user-1"}, expires_delta=timedelta(seconds=-1))
    assert decode_token(token, ACCESS_TOKEN_TYPE) is None
