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