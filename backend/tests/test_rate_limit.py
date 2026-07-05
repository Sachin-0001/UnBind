"""Tests for the per-plan daily rate limiter in analysis_routes._enforce_rate_limit."""

from datetime import datetime, timedelta, timezone

import pytest
from fastapi import HTTPException

from app.routes import analysis_routes


def _today():
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def _yesterday():
    return (datetime.now(timezone.utc) - timedelta(days=1)).strftime("%Y-%m-%d")


# ── Per-plan limits: first call under quota is allowed and increments ─────────


@pytest.mark.parametrize(
    "plan,limit",
    [(None, 1), ("Brief", 3), ("Motion", 5)],
)
async def test_first_analysis_of_day_allowed_and_increments(seed_user, plan, limit):
    user = seed_user(plan=plan, dailyAnalysisCount=0, lastAnalysisDate=_today())
    await analysis_routes._enforce_rate_limit(str(user["_id"]))

    calls = seed_user.db.users.update_calls
    assert len(calls) == 1
    changes = calls[0][1]["$set"]
    assert changes["dailyAnalysisCount"] == 1
    assert changes["lastAnalysisDate"] == _today()


@pytest.mark.parametrize(
    "plan,limit",
    [(None, 1), ("Brief", 3), ("Motion", 5)],
)
async def test_429_when_quota_reached(seed_user, plan, limit):
    user = seed_user(plan=plan, dailyAnalysisCount=limit, lastAnalysisDate=_today())
    with pytest.raises(HTTPException) as exc:
        await analysis_routes._enforce_rate_limit(str(user["_id"]))
    assert exc.value.status_code == 429
    # no increment should have happened on rejection
    assert seed_user.db.users.update_calls == []


async def test_verdict_plan_is_unlimited(seed_user):
    # A count far above any finite limit must still pass for Verdict.
    user = seed_user(plan="Verdict", dailyAnalysisCount=9999, lastAnalysisDate=_today())
    await analysis_routes._enforce_rate_limit(str(user["_id"]))
    # unlimited plan short-circuits before writing anything
    assert seed_user.db.users.update_calls == []


async def test_unknown_plan_defaults_to_free_limit(seed_user):
    user = seed_user(plan="Mystery", dailyAnalysisCount=1, lastAnalysisDate=_today())
    with pytest.raises(HTTPException) as exc:
        await analysis_routes._enforce_rate_limit(str(user["_id"]))
    assert exc.value.status_code == 429


# ── Daily counter reset ──────────────────────────────────────────────────────


async def test_counter_resets_on_new_day(seed_user):
    """A stale count from yesterday must reset, so today's first call passes."""
    user = seed_user(plan="Brief", dailyAnalysisCount=3, lastAnalysisDate=_yesterday())
    await analysis_routes._enforce_rate_limit(str(user["_id"]))

    calls = seed_user.db.users.update_calls
    assert len(calls) == 1
    changes = calls[0][1]["$set"]
    # reset to 0 then incremented to 1
    assert changes["dailyAnalysisCount"] == 1
    assert changes["lastAnalysisDate"] == _today()


async def test_missing_counter_fields_treated_as_zero(seed_user):
    user = seed_user(plan="Brief")  # no dailyAnalysisCount / lastAnalysisDate
    await analysis_routes._enforce_rate_limit(str(user["_id"]))
    changes = seed_user.db.users.update_calls[0][1]["$set"]
    assert changes["dailyAnalysisCount"] == 1


# ── Auth guard ───────────────────────────────────────────────────────────────


async def test_missing_user_raises_401(fake_db):
    from bson import ObjectId

    with pytest.raises(HTTPException) as exc:
        await analysis_routes._enforce_rate_limit(str(ObjectId()))
    assert exc.value.status_code == 401
