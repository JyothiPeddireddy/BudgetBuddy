"""
app/core/permissions.py

Role/tier gating for Budget Buddy.
Matches your existing app.core.deps.get_current_user and app.models.user.User.

Roles: "user" (default), "premium", "admin"  -- stored as plain strings on User.role
"""

from enum import Enum
from typing import Optional
from datetime import date, datetime

from fastapi import Depends, HTTPException, Query, status

from app.core.deps import get_current_user
from app.models.user import User


# ---------------------------------------------------------------------------
# 1. Role definitions
# ---------------------------------------------------------------------------

class UserRole(str, Enum):
    USER = "user"
    PREMIUM = "premium"
    ADMIN = "admin"


ROLE_RANK = {
    UserRole.USER: 0,
    UserRole.PREMIUM: 1,
    UserRole.ADMIN: 2,
}


def has_min_role(user: User, minimum: UserRole) -> bool:
    """
    Defensive against bad/missing role values: anything not in ROLE_RANK
    (e.g. leftover 'student' rows you haven't migrated yet) is treated as
    the lowest tier rather than raising a KeyError.
    """
    try:
        user_role = UserRole(user.role)
    except ValueError:
        user_role = UserRole.USER
    return ROLE_RANK[user_role] >= ROLE_RANK[minimum]


# ---------------------------------------------------------------------------
# 2. Exact-role gating -- for admin-only endpoints
# ---------------------------------------------------------------------------

class RequireRole:
    """
    Usage:
        @router.get("/admin/users")
        def list_users(admin: User = Depends(RequireRole(UserRole.ADMIN))):
            ...
    """

    def __init__(self, *allowed_roles: UserRole):
        self.allowed_roles = set(allowed_roles)

    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        try:
            role = UserRole(current_user.role)
        except ValueError:
            role = UserRole.USER

        if role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this resource.",
            )
        return current_user


require_admin = RequireRole(UserRole.ADMIN)


# ---------------------------------------------------------------------------
# 3. Minimum-tier gating -- for "Premium and above" endpoints
# ---------------------------------------------------------------------------

class RequireMinRole:
    """
    Usage:
        @router.get("/analytics/monthly-trend")
        def monthly_trend(user: User = Depends(RequireMinRole(UserRole.PREMIUM))):
            ...
    """

    def __init__(self, minimum: UserRole):
        self.minimum = minimum

    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        if not has_min_role(current_user, self.minimum):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"This feature requires {self.minimum.value} tier or higher.",
            )
        return current_user


require_premium_plus = RequireMinRole(UserRole.PREMIUM)


# ---------------------------------------------------------------------------
# 4. Tier-gated date range for analytics
# ---------------------------------------------------------------------------
# User tier -> always locked to current month, no matter what query params
# are sent (enforced server-side, not just hidden in the UI).
# Premium/Admin -> free to pass start_date / end_date.

def resolve_analytics_range(
    current_user: User = Depends(get_current_user),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
) -> tuple[date, date]:
    today = datetime.utcnow().date()
    current_month_start = today.replace(day=1)

    if not has_min_role(current_user, UserRole.PREMIUM):
        return current_month_start, today

    if start_date and end_date:
        if start_date > end_date:
            raise HTTPException(400, "start_date must be before end_date")
        return start_date, end_date

    return current_month_start, today


# ---------------------------------------------------------------------------
# 5. Tier-gated months-back window for /monthly-trend
# ---------------------------------------------------------------------------
# Table says User tier gets "basic charts" (no trend line at all), Premium
# gets 6-12 months of history. Since /monthly-trend is Premium-only per
# your feature table, gate the WHOLE endpoint with require_premium_plus
# (see analytics.py patch below) rather than clamping `months` here.


# ---------------------------------------------------------------------------
# 6. Export format gating
# ---------------------------------------------------------------------------
# User tier = "Limited" export. Defining that explicitly as: no PDF/Excel,
# CSV only, current-month only. Change this if you meant something else.

class ExportFormat(str, Enum):
    CSV = "csv"
    PDF = "pdf"
    EXCEL = "excel"


def require_export_access(current_user: User = Depends(get_current_user)) -> User:
    """
    Use this directly on /export/pdf and /export/excel routes -- those two
    formats are Premium+/Admin only per your table (User tier is "Limited",
    i.e. CSV/basic export only, which you haven't built yet).
    """
    if not has_min_role(current_user, UserRole.PREMIUM):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="PDF/Excel export requires Premium. Free tier export is limited to CSV, current month only.",
        )
    return current_user