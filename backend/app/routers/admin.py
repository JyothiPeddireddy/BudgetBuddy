# from datetime import date
# from typing import Optional

# from fastapi import APIRouter, Depends, HTTPException, Query
# from sqlalchemy.orm import Session
# from sqlalchemy import func

# from pydantic import BaseModel

# from app.database import get_db
# from app.core.permissions import require_admin
# from app.models.user import User
# from app.models.expense import Expense
# from app.models.income import Income
# from app.models.savings_goal import SavingsGoal
# from app.models.account import Account

# from app.crud.expense import get_expenses_by_user
# from app.crud.income import get_incomes_by_user
# from app.crud.savings_goal import get_goals_by_user
# from app.crud.account import get_accounts_by_user


# router = APIRouter(
#     prefix="/admin",
#     tags=["Admin"],
# )


# class RoleUpdateRequest(BaseModel):
#     role: str


# # ============================================================
# # Helper
# # ============================================================

# def _get_target_user_or_404(
#     db: Session,
#     user_id: int,
# ) -> User:

#     target = (
#         db.query(User)
#         .filter(User.id == user_id)
#         .first()
#     )

#     if not target:
#         raise HTTPException(
#             status_code=404,
#             detail="User not found",
#         )

#     return target


# # ============================================================
# # GET /admin/users
# # ============================================================

# @router.get("/users")
# def list_all_users(
#     db: Session = Depends(get_db),
#     admin: User = Depends(require_admin),
# ):

#     users = (
#         db.query(User)
#         .order_by(User.id)
#         .all()
#     )

#     return [
#         {
#             "id": u.id,
#             "username": u.username,
#             "email": u.email,
#             "role": u.role,
#             "is_verified": u.is_verified,
#             "premium_requested": u.premium_requested,
#         }
#         for u in users
#     ]


# # ============================================================
# # POST /admin/users/{user_id}/approve-premium
# #
# # Admin can approve ONLY users who requested Premium.
# # ============================================================

# @router.post("/users/{user_id}/approve-premium")
# def approve_premium(
#     user_id: int,
#     db: Session = Depends(get_db),
#     admin: User = Depends(require_admin),
# ):

#     target = _get_target_user_or_404(
#         db,
#         user_id,
#     )

#     # Never change admin
#     if target.role == "admin":
#         raise HTTPException(
#             status_code=400,
#             detail="Admin account cannot be changed.",
#         )

#     # Already Premium
#     if target.role == "premium":
#         raise HTTPException(
#             status_code=400,
#             detail="User is already Premium.",
#         )

#     # CRITICAL CHECK
#     # User MUST have submitted a Premium request.
#     if not target.premium_requested:
#         raise HTTPException(
#             status_code=400,
#             detail="This user has not requested Premium.",
#         )

#     # Upgrade ONLY this user
#     target.role = "premium"

#     # Request has now been handled
#     target.premium_requested = False

#     db.commit()
#     db.refresh(target)

#     return {
#         "message": "Premium approved successfully.",
#         "id": target.id,
#         "username": target.username,
#         "email": target.email,
#         "role": target.role,
#         "premium_requested": target.premium_requested,
#     }


# # ============================================================
# # POST /admin/users/{user_id}/reject-premium
# # ============================================================

# @router.post("/users/{user_id}/reject-premium")
# def reject_premium(
#     user_id: int,
#     db: Session = Depends(get_db),
#     admin: User = Depends(require_admin),
# ):

#     target = _get_target_user_or_404(
#         db,
#         user_id,
#     )

#     if target.role == "admin":
#         raise HTTPException(
#             status_code=400,
#             detail="Admin account cannot be changed.",
#         )

#     if not target.premium_requested:
#         raise HTTPException(
#             status_code=400,
#             detail="This user has no pending Premium request.",
#         )

#     target.premium_requested = False

#     db.commit()
#     db.refresh(target)

#     return {
#         "message": "Premium request rejected.",
#         "id": target.id,
#         "username": target.username,
#         "email": target.email,
#         "role": target.role,
#         "premium_requested": target.premium_requested,
#     }


# # ============================================================
# # GET /admin/users/{user_id}
# # ============================================================

# @router.get("/users/{user_id}")
# def get_user_detail(
#     user_id: int,
#     db: Session = Depends(get_db),
#     admin: User = Depends(require_admin),
# ):

#     target = _get_target_user_or_404(
#         db,
#         user_id,
#     )

#     return {
#         "id": target.id,
#         "username": target.username,
#         "email": target.email,
#         "role": target.role,
#         "is_verified": target.is_verified,
#         "premium_requested": target.premium_requested,
#     }


# # ============================================================
# # GET /admin/users/{user_id}/expenses
# # ============================================================

# @router.get("/users/{user_id}/expenses")
# def get_user_expenses(
#     user_id: int,
#     skip: int = Query(0, ge=0),
#     limit: int = Query(100, le=500),
#     db: Session = Depends(get_db),
#     admin: User = Depends(require_admin),
# ):

#     _get_target_user_or_404(
#         db,
#         user_id,
#     )

#     return get_expenses_by_user(
#         db,
#         user_id,
#         skip,
#         limit,
#     )


# # ============================================================
# # GET /admin/users/{user_id}/incomes
# # ============================================================

# @router.get("/users/{user_id}/incomes")
# def get_user_incomes(
#     user_id: int,
#     skip: int = Query(0, ge=0),
#     limit: int = Query(100, le=500),
#     db: Session = Depends(get_db),
#     admin: User = Depends(require_admin),
# ):

#     _get_target_user_or_404(
#         db,
#         user_id,
#     )

#     return get_incomes_by_user(
#         db,
#         user_id,
#         skip,
#         limit,
#     )


# # ============================================================
# # GET /admin/users/{user_id}/goals
# # ============================================================

# @router.get("/users/{user_id}/goals")
# def get_user_goals(
#     user_id: int,
#     db: Session = Depends(get_db),
#     admin: User = Depends(require_admin),
# ):

#     _get_target_user_or_404(
#         db,
#         user_id,
#     )

#     return get_goals_by_user(
#         db,
#         user_id,
#     )


# # ============================================================
# # GET /admin/users/{user_id}/accounts
# # ============================================================

# @router.get("/users/{user_id}/accounts")
# def get_user_accounts(
#     user_id: int,
#     db: Session = Depends(get_db),
#     admin: User = Depends(require_admin),
# ):

#     _get_target_user_or_404(
#         db,
#         user_id,
#     )

#     return get_accounts_by_user(
#         db,
#         user_id,
#     )


# # ============================================================
# # GET /admin/users/{user_id}/summary
# # ============================================================

# @router.get("/users/{user_id}/summary")
# def get_user_financial_summary(
#     user_id: int,
#     month: Optional[int] = Query(
#         None,
#         ge=1,
#         le=12,
#     ),
#     year: Optional[int] = Query(
#         None,
#         ge=2000,
#         le=2100,
#     ),
#     db: Session = Depends(get_db),
#     admin: User = Depends(require_admin),
# ):

#     _get_target_user_or_404(
#         db,
#         user_id,
#     )

#     today = date.today()

#     target_month = month or today.month
#     target_year = year or today.year

#     total_income = (
#         db.query(func.sum(Income.amount))
#         .filter(
#             Income.user_id == user_id,
#             func.extract(
#                 "month",
#                 Income.date,
#             ) == target_month,
#             func.extract(
#                 "year",
#                 Income.date,
#             ) == target_year,
#         )
#         .scalar()
#         or 0
#     )

#     total_expenses = (
#         db.query(func.sum(Expense.amount))
#         .filter(
#             Expense.user_id == user_id,
#             func.extract(
#                 "month",
#                 Expense.date,
#             ) == target_month,
#             func.extract(
#                 "year",
#                 Expense.date,
#             ) == target_year,
#         )
#         .scalar()
#         or 0
#     )

#     total_balance = (
#         db.query(func.sum(Account.balance))
#         .filter(
#             Account.user_id == user_id
#         )
#         .scalar()
#         or 0
#     )

#     return {
#         "user_id": user_id,
#         "month": target_month,
#         "year": target_year,
#         "total_income": float(total_income),
#         "total_expenses": float(total_expenses),
#         "net_savings": (
#             float(total_income)
#             - float(total_expenses)
#         ),
#         "total_balance": float(total_balance),
#     }


# # ============================================================
# # GET /admin/system-analytics
# # ============================================================

# @router.get("/system-analytics")
# def system_analytics(
#     db: Session = Depends(get_db),
#     admin: User = Depends(require_admin),
# ):

#     total_users = (
#         db.query(func.count(User.id))
#         .scalar()
#         or 0
#     )

#     users_by_role = dict(
#         db.query(
#             User.role,
#             func.count(User.id),
#         )
#         .group_by(User.role)
#         .all()
#     )

#     total_expenses_all_users = float(
#         db.query(
#             func.sum(Expense.amount)
#         )
#         .scalar()
#         or 0
#     )

#     total_income_all_users = float(
#         db.query(
#             func.sum(Income.amount)
#         )
#         .scalar()
#         or 0
#     )

#     total_balance_all_users = float(
#         db.query(
#             func.sum(Account.balance)
#         )
#         .scalar()
#         or 0
#     )

#     total_goals = (
#         db.query(
#             func.count(SavingsGoal.id)
#         )
#         .scalar()
#         or 0
#     )

#     completed_goals = (
#         db.query(
#             func.count(SavingsGoal.id)
#         )
#         .filter(
#             SavingsGoal.status == "completed"
#         )
#         .scalar()
#         or 0
#     )

#     pending_premium_requests = (
#         db.query(
#             func.count(User.id)
#         )
#         .filter(
#             User.role == "user",
#             User.premium_requested == True,
#         )
#         .scalar()
#         or 0
#     )

#     top_categories_system_wide = (
#         db.query(
#             Expense.category,
#             func.sum(
#                 Expense.amount
#             ).label("total"),
#         )
#         .group_by(
#             Expense.category
#         )
#         .order_by(
#             func.sum(
#                 Expense.amount
#             ).desc()
#         )
#         .limit(5)
#         .all()
#     )

#     return {
#         "total_users": total_users,
#         "users_by_role": users_by_role,
#         "total_income_all_users": total_income_all_users,
#         "total_expenses_all_users": total_expenses_all_users,
#         "total_balance_all_users": total_balance_all_users,
#         "net_all_users": (
#             total_income_all_users
#             - total_expenses_all_users
#         ),
#         "total_goals": total_goals,
#         "completed_goals": completed_goals,
#         "pending_premium_requests": pending_premium_requests,
#         "top_categories_system_wide": [
#             {
#                 "category": category,
#                 "total": float(total),
#             }
#             for category, total
#             in top_categories_system_wide
#         ],
#     }







from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from pydantic import BaseModel

from app.database import get_db
from app.core.permissions import require_admin
from app.models.user import User
from app.models.expense import Expense
from app.models.income import Income
from app.models.savings_goal import SavingsGoal
from app.models.account import Account

from app.crud.expense import get_expenses_by_user
from app.crud.income import get_incomes_by_user
from app.crud.savings_goal import get_goals_by_user
from app.crud.account import get_accounts_by_user


router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)


class RoleUpdateRequest(BaseModel):
    role: str


# ============================================================
# Helper
# ============================================================

def _get_target_user_or_404(
    db: Session,
    user_id: int,
) -> User:

    target = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not target:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    return target


# ============================================================
# GET /admin/users
# ============================================================

@router.get("/users")
def list_all_users(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):

    users = (
        db.query(User)
        .order_by(User.id)
        .all()
    )

    return [
        {
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "role": u.role,
            "is_verified": u.is_verified,
            "premium_requested": u.premium_requested,
        }
        for u in users
    ]


# ============================================================
# POST /admin/users/{user_id}/approve-premium
#
# Admin can approve ONLY users who requested Premium.
# ============================================================

@router.post("/users/{user_id}/approve-premium")
def approve_premium(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):

    target = _get_target_user_or_404(
        db,
        user_id,
    )

    # Never change admin
    if target.role == "admin":
        raise HTTPException(
            status_code=400,
            detail="Admin account cannot be changed.",
        )

    # Already Premium
    if target.role == "premium":
        raise HTTPException(
            status_code=400,
            detail="User is already Premium.",
        )

    # CRITICAL CHECK
    # User MUST have submitted a Premium request.
    if not target.premium_requested:
        raise HTTPException(
            status_code=400,
            detail="This user has not requested Premium.",
        )

    # Upgrade ONLY this user
    target.role = "premium"

    # Request has now been handled
    target.premium_requested = False

    db.commit()
    db.refresh(target)

    return {
        "message": "Premium approved successfully.",
        "id": target.id,
        "username": target.username,
        "email": target.email,
        "role": target.role,
        "premium_requested": target.premium_requested,
    }


# ============================================================
# POST /admin/users/{user_id}/reject-premium
# ============================================================

@router.post("/users/{user_id}/reject-premium")
def reject_premium(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):

    target = _get_target_user_or_404(
        db,
        user_id,
    )

    if target.role == "admin":
        raise HTTPException(
            status_code=400,
            detail="Admin account cannot be changed.",
        )

    if not target.premium_requested:
        raise HTTPException(
            status_code=400,
            detail="This user has no pending Premium request.",
        )

    target.premium_requested = False

    db.commit()
    db.refresh(target)

    return {
        "message": "Premium request rejected.",
        "id": target.id,
        "username": target.username,
        "email": target.email,
        "role": target.role,
        "premium_requested": target.premium_requested,
    }


# ============================================================
# POST /admin/users/{user_id}/downgrade-premium
#
# Admin can move an existing Premium user back down to User at
# any time -- independent of the original request/approval flow.
# ============================================================

@router.post("/users/{user_id}/downgrade-premium")
def downgrade_premium(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):

    target = _get_target_user_or_404(
        db,
        user_id,
    )

    if target.role == "admin":
        raise HTTPException(
            status_code=400,
            detail="Admin account cannot be changed.",
        )

    if target.role != "premium":
        raise HTTPException(
            status_code=400,
            detail="User is not currently Premium.",
        )

    target.role = "user"
    # No outstanding request after a downgrade -- if they want Premium
    # again later, they submit a fresh request from their Profile page.
    target.premium_requested = False

    db.commit()
    db.refresh(target)

    return {
        "message": "User downgraded to standard access.",
        "id": target.id,
        "username": target.username,
        "email": target.email,
        "role": target.role,
        "premium_requested": target.premium_requested,
    }


# ============================================================
# GET /admin/users/{user_id}
# ============================================================

@router.get("/users/{user_id}")
def get_user_detail(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):

    target = _get_target_user_or_404(
        db,
        user_id,
    )

    return {
        "id": target.id,
        "username": target.username,
        "email": target.email,
        "role": target.role,
        "is_verified": target.is_verified,
        "premium_requested": target.premium_requested,
    }


# ============================================================
# GET /admin/users/{user_id}/expenses
# ============================================================

@router.get("/users/{user_id}/expenses")
def get_user_expenses(
    user_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=500),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):

    _get_target_user_or_404(
        db,
        user_id,
    )

    return get_expenses_by_user(
        db,
        user_id,
        skip,
        limit,
    )


# ============================================================
# GET /admin/users/{user_id}/incomes
# ============================================================

@router.get("/users/{user_id}/incomes")
def get_user_incomes(
    user_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=500),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):

    _get_target_user_or_404(
        db,
        user_id,
    )

    return get_incomes_by_user(
        db,
        user_id,
        skip,
        limit,
    )


# ============================================================
# GET /admin/users/{user_id}/goals
# ============================================================

@router.get("/users/{user_id}/goals")
def get_user_goals(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):

    _get_target_user_or_404(
        db,
        user_id,
    )

    return get_goals_by_user(
        db,
        user_id,
    )


# ============================================================
# GET /admin/users/{user_id}/accounts
# ============================================================

@router.get("/users/{user_id}/accounts")
def get_user_accounts(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):

    _get_target_user_or_404(
        db,
        user_id,
    )

    return get_accounts_by_user(
        db,
        user_id,
    )


# ============================================================
# GET /admin/users/{user_id}/summary
# ============================================================

@router.get("/users/{user_id}/summary")
def get_user_financial_summary(
    user_id: int,
    month: Optional[int] = Query(
        None,
        ge=1,
        le=12,
    ),
    year: Optional[int] = Query(
        None,
        ge=2000,
        le=2100,
    ),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):

    _get_target_user_or_404(
        db,
        user_id,
    )

    today = date.today()

    target_month = month or today.month
    target_year = year or today.year

    total_income = (
        db.query(func.sum(Income.amount))
        .filter(
            Income.user_id == user_id,
            func.extract(
                "month",
                Income.date,
            ) == target_month,
            func.extract(
                "year",
                Income.date,
            ) == target_year,
        )
        .scalar()
        or 0
    )

    total_expenses = (
        db.query(func.sum(Expense.amount))
        .filter(
            Expense.user_id == user_id,
            func.extract(
                "month",
                Expense.date,
            ) == target_month,
            func.extract(
                "year",
                Expense.date,
            ) == target_year,
        )
        .scalar()
        or 0
    )

    total_balance = (
        db.query(func.sum(Account.balance))
        .filter(
            Account.user_id == user_id
        )
        .scalar()
        or 0
    )

    return {
        "user_id": user_id,
        "month": target_month,
        "year": target_year,
        "total_income": float(total_income),
        "total_expenses": float(total_expenses),
        "net_savings": (
            float(total_income)
            - float(total_expenses)
        ),
        "total_balance": float(total_balance),
    }


# ============================================================
# GET /admin/system-analytics
# ============================================================

@router.get("/system-analytics")
def system_analytics(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):

    total_users = (
        db.query(func.count(User.id))
        .scalar()
        or 0
    )

    users_by_role = dict(
        db.query(
            User.role,
            func.count(User.id),
        )
        .group_by(User.role)
        .all()
    )

    total_expenses_all_users = float(
        db.query(
            func.sum(Expense.amount)
        )
        .scalar()
        or 0
    )

    total_income_all_users = float(
        db.query(
            func.sum(Income.amount)
        )
        .scalar()
        or 0
    )

    total_balance_all_users = float(
        db.query(
            func.sum(Account.balance)
        )
        .scalar()
        or 0
    )

    total_goals = (
        db.query(
            func.count(SavingsGoal.id)
        )
        .scalar()
        or 0
    )

    completed_goals = (
        db.query(
            func.count(SavingsGoal.id)
        )
        .filter(
            SavingsGoal.status == "completed"
        )
        .scalar()
        or 0
    )

    pending_premium_requests = (
        db.query(
            func.count(User.id)
        )
        .filter(
            User.role == "user",
            User.premium_requested == True,
        )
        .scalar()
        or 0
    )

    top_categories_system_wide = (
        db.query(
            Expense.category,
            func.sum(
                Expense.amount
            ).label("total"),
        )
        .group_by(
            Expense.category
        )
        .order_by(
            func.sum(
                Expense.amount
            ).desc()
        )
        .limit(5)
        .all()
    )

    return {
        "total_users": total_users,
        "users_by_role": users_by_role,
        "total_income_all_users": total_income_all_users,
        "total_expenses_all_users": total_expenses_all_users,
        "total_balance_all_users": total_balance_all_users,
        "net_all_users": (
            total_income_all_users
            - total_expenses_all_users
        ),
        "total_goals": total_goals,
        "completed_goals": completed_goals,
        "pending_premium_requests": pending_premium_requests,
        "top_categories_system_wide": [
            {
                "category": category,
                "total": float(total),
            }
            for category, total
            in top_categories_system_wide
        ],
    }