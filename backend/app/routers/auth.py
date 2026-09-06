from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import UserCreate, UserOut
from app.schemas.auth import (
    Token, MessageResponse, SignupResponse, OTPVerifyRequest,
    ResendOtpRequest, ForgotPasswordRequest, ResetPasswordRequest,
)
from app.crud.user import (
    get_user_by_email, create_user, set_user_otp, verify_user_otp, update_user_password,
)
from app.core.security import (
    verify_password, create_access_token, hash_password,
    create_password_reset_token, decode_password_reset_token,
)
from app.core.email import send_otp_email, send_password_reset_email
from app.core.deps import get_current_user

router = APIRouter()

@router.post("/signup", response_model=SignupResponse)
def signup(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = get_user_by_email(db, user_in.email)

    if existing:
        if existing.is_verified:
            raise HTTPException(status_code=400, detail="Email already registered")
        # Account exists but was never verified — treat this as a resend, not a duplicate.
        otp_code = set_user_otp(db, existing)
        try:
            send_otp_email(existing.email, otp_code)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to send verification code: {e}")
        return {"message": "An account with this email already exists but isn't verified. We've sent a new code.", "email": existing.email}

    user = create_user(db, user_in.username, user_in.email, user_in.password)
    otp_code = set_user_otp(db, user)

    try:
        send_otp_email(user.email, otp_code)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Account created but failed to send verification code: {e}")

    return {"message": "Signup successful. Enter the code sent to your email.", "email": user.email}


@router.post("/verify-otp", response_model=MessageResponse)
def verify_otp(payload: OTPVerifyRequest, db: Session = Depends(get_db)):
    user = get_user_by_email(db, payload.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_verified:
        return {"message": "Email already verified. You can log in."}
    if not verify_user_otp(db, user, payload.otp):
        raise HTTPException(status_code=400, detail="Invalid or expired code")
    return {"message": "Email verified successfully. You can now log in."}


@router.post("/resend-otp", response_model=MessageResponse)
def resend_otp(payload: ResendOtpRequest, db: Session = Depends(get_db)):
    user = get_user_by_email(db, payload.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_verified:
        return {"message": "Email already verified. You can log in."}
    otp_code = set_user_otp(db, user)
    try:
        send_otp_email(user.email, otp_code)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to resend code: {e}")
    return {"message": "A new code has been sent to your email."}


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = get_user_by_email(db, form_data.username)
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Please verify your email before logging in")

    token = create_access_token(data={"sub": user.email, "role": user.role})
    return {"access_token": token, "token_type": "bearer"}


@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = get_user_by_email(db, payload.email)
    # Same response whether or not the account exists — avoids revealing which emails are registered
    if user:
        token = create_password_reset_token(user.email)
        try:
            send_password_reset_email(user.email, token)
        except Exception:
            pass
    return {"message": "If an account exists for that email, a reset link has been sent."}


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    email = decode_password_reset_token(payload.token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid or expired reset link")

    user = get_user_by_email(db, email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    update_user_password(db, user, hash_password(payload.new_password))
    return {"message": "Password reset successfully. You can now log in."}


@router.get("/me", response_model=UserOut)
def read_current_user(current_user = Depends(get_current_user)):
    return current_user