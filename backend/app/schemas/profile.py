# from pydantic import BaseModel, EmailStr, field_validator
# from typing import Optional


# class ProfileOut(BaseModel):
#     username: str
#     email: EmailStr
#     is_verified: bool
#     full_name: Optional[str] = None
#     phone_number: Optional[str] = None
#     monthly_income: Optional[float] = None
#     financial_preferences: Optional[str] = None

#     class Config:
#         from_attributes = True


# class ProfileUpdate(BaseModel):
#     """
#     Deliberately excludes username and email — email is locked once
#     verified, and username changes aren't part of this milestone's scope.
#     """
#     full_name: Optional[str] = None
#     phone_number: Optional[str] = None
#     monthly_income: Optional[float] = None
#     financial_preferences: Optional[str] = None

#     @field_validator("phone_number")
#     @classmethod
#     def validate_phone(cls, value):
#         if value in (None, ""):
#             return None
#         digits = value.replace(" ", "").replace("-", "").replace("+", "")
#         if not digits.isdigit() or not (7 <= len(digits) <= 15):
#             raise ValueError("Enter a valid phone number")
#         return value

#     @field_validator("monthly_income")
#     @classmethod
#     def validate_income(cls, value):
#         if value is not None and value < 0:
#             raise ValueError("Monthly income can't be negative")
#         return value

#     @field_validator("full_name")
#     @classmethod
#     def validate_full_name(cls, value):
#         if value is not None and len(value) > 100:
#             raise ValueError("Full name is too long")
#         return value



from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional


class ProfileOut(BaseModel):
    username: str
    email: EmailStr
    is_verified: bool
    role: str
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    monthly_income: Optional[float] = None
    financial_preferences: Optional[str] = None

    @field_validator("role", mode="before")
    @classmethod
    def coerce_role(cls, value):
        # Handles `role` being a Python/SQLAlchemy Enum object instead of
        # a plain string.
        return value.value if hasattr(value, "value") else value

    class Config:
        from_attributes = True


class ProfileUpdate(BaseModel):
    """
    Deliberately excludes username and email — email is locked once
    verified, and username changes aren't part of this milestone's scope.
    """
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    monthly_income: Optional[float] = None
    financial_preferences: Optional[str] = None

    @field_validator("phone_number")
    @classmethod
    def validate_phone(cls, value):
        if value in (None, ""):
            return None
        digits = value.replace(" ", "").replace("-", "").replace("+", "")
        if not digits.isdigit() or not (7 <= len(digits) <= 15):
            raise ValueError("Enter a valid phone number")
        return value

    @field_validator("monthly_income")
    @classmethod
    def validate_income(cls, value):
        if value is not None and value < 0:
            raise ValueError("Monthly income can't be negative")
        return value

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, value):
        if value is not None and len(value) > 100:
            raise ValueError("Full name is too long")
        return value