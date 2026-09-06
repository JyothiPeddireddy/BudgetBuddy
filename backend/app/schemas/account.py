from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional

class AccountBase(BaseModel):
    account_name: str
    bank_name: str  # <-- CHANGED: now required, no longer Optional
    account_type: str
    balance: float = Field(default=0, ge=0)

    @field_validator("bank_name")
    @classmethod
    def bank_name_not_blank(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("bank_name must not be empty")
        return v.strip()

class AccountCreate(AccountBase):
    pass

class AccountUpdate(BaseModel):
    account_name: Optional[str] = None
    bank_name: Optional[str] = None  # still optional here -- this is a partial-update schema
    account_type: Optional[str] = None
    balance: Optional[float] = Field(default=None, ge=0)

    @field_validator("bank_name")
    @classmethod
    def bank_name_not_blank_if_provided(cls, v: Optional[str]) -> Optional[str]:
        # If the caller explicitly sends bank_name, it still can't be blank --
        # but omitting the field entirely (partial update) is still fine.
        if v is not None and not v.strip():
            raise ValueError("bank_name must not be empty")
        return v.strip() if v is not None else v

class AccountOut(AccountBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True