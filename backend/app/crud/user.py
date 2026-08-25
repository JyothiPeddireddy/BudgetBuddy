# from sqlalchemy.orm import Session
# from app.models.user import User
# from app.core.security import hash_password

# def get_user_by_email(db: Session, email: str):
#     return db.query(User).filter(User.email == email).first()

# def create_user(db: Session, username: str, email: str, password: str):
#     user = User(
#         username=username,
#         email=email,
#         password=hash_password(password),
#         is_verified=False,
#     )
#     db.add(user)
#     db.commit()
#     db.refresh(user)
#     return user

# def mark_user_verified(db: Session, user: User):
#     user.is_verified = True
#     db.commit()
#     db.refresh(user)
#     return user



import random
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import hash_password
from app.config import OTP_EXPIRE_MINUTES

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, username: str, email: str, password: str):
    user = User(
        username=username,
        email=email,
        password=hash_password(password),
        is_verified=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def mark_user_verified(db: Session, user: User):
    user.is_verified = True
    db.commit()
    db.refresh(user)
    return user

def set_user_otp(db: Session, user: User) -> str:
    otp_code = f"{random.randint(0, 999999):06d}"
    user.otp_code = otp_code
    user.otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRE_MINUTES)
    db.commit()
    db.refresh(user)
    return otp_code

def verify_user_otp(db: Session, user: User, otp_code: str) -> bool:
    if not user.otp_code or not user.otp_expires_at:
        return False

    expires_at = user.otp_expires_at
    if expires_at.tzinfo is None:
        # Safety net for any rows written before this fix
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if datetime.now(timezone.utc) > expires_at:
        return False
    if user.otp_code != otp_code:
        return False
    user.is_verified = True
    user.otp_code = None
    user.otp_expires_at = None
    db.commit()
    db.refresh(user)
    return True

def update_user_password(db: Session, user: User, new_hashed_password: str):
    user.password = new_hashed_password
    db.commit()
    db.refresh(user)
    return user