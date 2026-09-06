from pydantic import BaseModel, EmailStr, field_validator
import re

def validate_password_strength(value: str) -> str:
    if len(value) < 8:
        raise ValueError("Password must be at least 8 characters long")
    if not re.search(r"[A-Z]", value):
        raise ValueError("Password must contain at least one uppercase letter")
    if not re.search(r"[a-z]", value):
        raise ValueError("Password must contain at least one lowercase letter")
    if not re.search(r"\d", value):
        raise ValueError("Password must contain at least one number")
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", value):
        raise ValueError("Password must contain at least one special character")
    return value

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        return validate_password_strength(value)


    @field_validator("email")
    @classmethod
    def validate_email_spaces(cls, value: str) -> str:
        if any(char.isspace() for char in value):
            raise ValueError("Email must not contain spaces")

        return value

class UserOut(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str
    is_verified: bool

    class Config:
        from_attributes = True