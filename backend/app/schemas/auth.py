# from pydantic import BaseModel

# class Token(BaseModel):
#     access_token: str
#     token_type: str

# class MessageResponse(BaseModel):
#     message: str


from pydantic import BaseModel, EmailStr, field_validator
from app.schemas.user import validate_password_strength

class Token(BaseModel):
    access_token: str
    token_type: str

class MessageResponse(BaseModel):
    message: str

class SignupResponse(BaseModel):
    message: str
    email: EmailStr

class OTPVerifyRequest(BaseModel):
    email: EmailStr
    otp: str

class ResendOtpRequest(BaseModel):
    email: EmailStr

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        return validate_password_strength(value)