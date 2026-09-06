# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session

# from app.database import get_db
# from app.core.deps import get_current_user
# from app.models.user import User
# from app.core.email import _send_email  # reuse existing SMTP helper

# router = APIRouter(prefix="/subscription", tags=["Subscription"])


# def get_admin_email(db: Session) -> str:
#     """
#     There is only ever one admin account, so we just look it up dynamically
#     rather than hardcoding an email in config -- if the admin account ever
#     changes, this keeps working with no code change needed.
#     """
#     admin = db.query(User).filter(User.role == "admin").first()
#     if not admin:
#         raise HTTPException(
#             status_code=500,
#             detail="No admin account is configured to receive subscription requests.",
#         )
#     return admin.email


# @router.post("/request-premium")
# def request_premium_upgrade(
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user),
# ):
#     """
#     Lets a User-tier account ask to be upgraded to Premium. This just
#     notifies the admin by email -- it does NOT auto-upgrade the account.
#     The admin reviews and flips the role manually (e.g. via psql/pgAdmin,
#     or later via the admin panel).
#     """
#     if current_user.role in ("premium", "admin"):
#         raise HTTPException(status_code=400, detail="You already have Premium access.")

#     admin_email = get_admin_email(db)

#     body = f"""
#     <p>A user has requested a Premium subscription upgrade on BudgetBuddy.</p>
#     <p><strong>Username:</strong> {current_user.username}<br>
#        <strong>Email:</strong> {current_user.email}<br>
#        <strong>Current role:</strong> {current_user.role}</p>
#     <p>Review and upgrade their account if approved.</p>
#     """

#     _send_email(admin_email, "BudgetBuddy: Premium upgrade request", body)

#     return {"message": "Your request has been sent to the admin for review."}







from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.deps import get_current_user
from app.models.user import User


router = APIRouter(
    prefix="/subscription",
    tags=["Subscription"],
)


@router.post("/request-premium")
def request_premium(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Admin doesn't need to request Premium
    if current_user.role == "admin":
        raise HTTPException(
            status_code=400,
            detail="Admin already has full access.",
        )

    # Already Premium
    if current_user.role == "premium":
        raise HTTPException(
            status_code=400,
            detail="You are already a Premium user.",
        )

    # Request already submitted
    if current_user.premium_requested:
        return {
            "message": "Premium request already sent.",
            "requested": True,
            "username": current_user.username,
            "email": current_user.email,
        }

    # Record the request
    current_user.premium_requested = True

    db.commit()
    db.refresh(current_user)

    return {
        "message": "Premium request sent to admin.",
        "requested": True,
        "username": current_user.username,
        "email": current_user.email,
    }