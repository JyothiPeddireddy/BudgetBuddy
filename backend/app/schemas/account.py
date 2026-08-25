from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class AccountBase(BaseModel):
    account_name: str
    bank_name: Optional[str] = None
    account_type: str
    balance: float = Field(default=0, ge=0)

class AccountCreate(AccountBase):
    pass

class AccountUpdate(BaseModel):
    account_name: Optional[str] = None
    bank_name: Optional[str] = None
    account_type: Optional[str] = None
    balance: Optional[float] = Field(default=None, ge=0)

class AccountOut(AccountBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True