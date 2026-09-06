# from fastapi import APIRouter, Depends
# from sqlalchemy.orm import Session

# from app.database import get_db
# from app.models.profile import Profile
# from app.schemas.profile import ProfileOut, ProfileUpdate
# from app.core.deps import get_current_user

# router = APIRouter(
#     prefix="/profile",
#     tags=["Profile"],
# )


# def get_or_create_profile(db: Session, current_user) -> Profile:
#     """
#     Most users won't have a Profile row yet (it isn't created at signup —
#     signup only collects username/email/password). Create an empty one
#     on first visit so the profile page always has something to read/edit.
#     """
#     profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
#     if not profile:
#         profile = Profile(user_id=current_user.id)
#         db.add(profile)
#         db.commit()
#         db.refresh(profile)
#     return profile


# def _to_out(current_user, profile: Profile) -> ProfileOut:
#     return ProfileOut(
#         username=current_user.username,
#         email=current_user.email,
#         is_verified=current_user.is_verified,
#         full_name=profile.full_name,
#         phone_number=profile.phone_number,
#         monthly_income=profile.monthly_income,
#         financial_preferences=profile.financial_preferences,
#     )


# @router.get("/me", response_model=ProfileOut)
# def read_my_profile(
#     db: Session = Depends(get_db),
#     current_user=Depends(get_current_user),
# ):
#     profile = get_or_create_profile(db, current_user)
#     return _to_out(current_user, profile)


# @router.put("/me", response_model=ProfileOut)
# def update_my_profile(
#     payload: ProfileUpdate,
#     db: Session = Depends(get_db),
#     current_user=Depends(get_current_user),
# ):
#     """
#     Only touches fields the client actually sent (exclude_unset), so a
#     partial update — e.g. just phone_number — doesn't blank out the rest.
#     username/email aren't accepted here at all; ProfileUpdate has no
#     fields for them.
#     """
#     profile = get_or_create_profile(db, current_user)

#     updates = payload.model_dump(exclude_unset=True)
#     for field, value in updates.items():
#         setattr(profile, field, value)

#     db.commit()
#     db.refresh(profile)

#     return _to_out(current_user, profile)




from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.profile import Profile
from app.schemas.profile import ProfileOut, ProfileUpdate
from app.core.deps import get_current_user

router = APIRouter(
    prefix="/profile",
    tags=["Profile"],
)


def get_or_create_profile(db: Session, current_user) -> Profile:
    """
    Most users won't have a Profile row yet (it isn't created at signup —
    signup only collects username/email/password). Create an empty one
    on first visit so the profile page always has something to read/edit.
    """
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


def _to_out(current_user, profile: Profile) -> ProfileOut:
    return ProfileOut(
        username=current_user.username,
        email=current_user.email,
        is_verified=current_user.is_verified,
        role=current_user.role,
        full_name=profile.full_name,
        phone_number=profile.phone_number,
        monthly_income=profile.monthly_income,
        financial_preferences=profile.financial_preferences,
    )


@router.get("/me", response_model=ProfileOut)
def read_my_profile(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    profile = get_or_create_profile(db, current_user)
    return _to_out(current_user, profile)


@router.put("/me", response_model=ProfileOut)
def update_my_profile(
    payload: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Only touches fields the client actually sent (exclude_unset), so a
    partial update — e.g. just phone_number — doesn't blank out the rest.
    username/email aren't accepted here at all; ProfileUpdate has no
    fields for them.
    """
    profile = get_or_create_profile(db, current_user)

    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)

    return _to_out(current_user, profile)