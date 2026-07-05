"""Tests for app.auth — token round-trips, tampering, hashing, local-dev detection."""

from datetime import datetime, timedelta, timezone

import pytest
from fastapi import HTTPException
from jose import jwt

from app import auth

# ── Token round-trip ─────────────────────────────────────────────────────────


def test_token_round_trip():
    token = auth.create_access_token("user-123")
    payload = auth.decode_access_token(token)
    assert payload["userId"] == "user-123"


def test_decode_tampered_token_raises_401():
    token = auth.create_access_token("user-123")
    # Mutate a character inside the payload segment (index 1). Avoid the last
    # char of a segment, whose trailing base64 padding bits can decode to the
    # same bytes; a mid-segment change reliably breaks the HMAC signature.
    header, payload, signature = token.split(".")
    new_char = "Z" if payload[1] != "Z" else "Y"
    tampered = f"{header}.{payload[0]}{new_char}{payload[2:]}.{signature}"
    with pytest.raises(HTTPException) as exc:
        auth.decode_access_token(tampered)
    assert exc.value.status_code == 401


def test_decode_token_signed_with_wrong_secret_raises_401():
    forged = jwt.encode(
        {"userId": "attacker", "exp": datetime.now(timezone.utc) + timedelta(days=1)},
        "some-other-secret",
        algorithm="HS256",
    )
    with pytest.raises(HTTPException) as exc:
        auth.decode_access_token(forged)
    assert exc.value.status_code == 401


def test_decode_expired_token_raises_401(override_settings):
    settings = override_settings
    expired = jwt.encode(
        {"userId": "user-123", "exp": datetime.now(timezone.utc) - timedelta(seconds=1)},
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM,
    )
    with pytest.raises(HTTPException) as exc:
        auth.decode_access_token(expired)
    assert exc.value.status_code == 401


def test_decode_garbage_token_raises_401():
    with pytest.raises(HTTPException) as exc:
        auth.decode_access_token("not.a.jwt")
    assert exc.value.status_code == 401


# ── Password hashing ─────────────────────────────────────────────────────────


def test_password_hash_and_verify():
    hashed = auth.hash_password("s3cret-p@ss")
    assert hashed != "s3cret-p@ss"
    assert auth.verify_password("s3cret-p@ss", hashed) is True
    assert auth.verify_password("wrong-pass", hashed) is False


def test_password_hash_is_salted():
    assert auth.hash_password("same") != auth.hash_password("same")


# ── _is_local_dev ────────────────────────────────────────────────────────────


def test_is_local_dev_true_on_localhost(override_settings):
    # settings fixture points FRONTEND_URL at localhost
    assert auth._is_local_dev(None) is True


def test_is_local_dev_false_on_prod_frontend(override_settings, monkeypatch):
    monkeypatch.setattr(override_settings, "FRONTEND_URL", "https://unbind.app")
    assert auth._is_local_dev(None) is False


class _FakeRequest:
    def __init__(self, headers):
        self.headers = headers


def test_is_local_dev_forwarded_proto_https_overrides_localhost(override_settings):
    """Even with a localhost FRONTEND_URL, X-Forwarded-Proto: https ⇒ not local."""
    req = _FakeRequest({"x-forwarded-proto": "https"})
    assert auth._is_local_dev(req) is False


def test_is_local_dev_forwarded_proto_http_stays_local(override_settings):
    req = _FakeRequest({"x-forwarded-proto": "http"})
    assert auth._is_local_dev(req) is True


# ── get_token_from_request ───────────────────────────────────────────────────


class _ReqWithCookiesHeaders:
    def __init__(self, cookies=None, headers=None):
        self.cookies = cookies or {}
        self.headers = headers or {}


def test_get_token_prefers_cookie(override_settings):
    req = _ReqWithCookiesHeaders(
        cookies={override_settings.COOKIE_NAME: "cookie-token"},
        headers={"Authorization": "Bearer header-token"},
    )
    assert auth.get_token_from_request(req) == "cookie-token"


def test_get_token_falls_back_to_bearer(override_settings):
    req = _ReqWithCookiesHeaders(headers={"Authorization": "Bearer header-token"})
    assert auth.get_token_from_request(req) == "header-token"


def test_get_token_none_when_absent(override_settings):
    assert auth.get_token_from_request(_ReqWithCookiesHeaders()) is None


async def test_get_current_user_id_no_token_raises_401(override_settings):
    with pytest.raises(HTTPException) as exc:
        await auth.get_current_user_id(_ReqWithCookiesHeaders())
    assert exc.value.status_code == 401


async def test_get_current_user_id_valid_token(override_settings):
    token = auth.create_access_token("user-abc")
    req = _ReqWithCookiesHeaders(cookies={override_settings.COOKIE_NAME: token})
    assert await auth.get_current_user_id(req) == "user-abc"
