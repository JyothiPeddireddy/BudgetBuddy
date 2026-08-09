from pydantic import BaseModel, Field
from datetime import date as date_type
from typing import Optional

class IncomeBase(BaseModel):
    account_id: int
    source: str
    amount: float = Field(gt=0)
    date: date_type
    notes: Optional[str] = None

class IncomeCreate(IncomeBase):
    pass

class IncomeUpdate(BaseModel):
    account_id: Optional[int] = None
    source: Optional[str] = None
    amount: Optional[float] = Field(default=None, gt=0)
    date: Optional[date_type] = None
    notes: Optional[str] = None

class IncomeOut(BaseModel):
    id: int
    user_id: int
    account_id: Optional[int] = None   # <-- optional here too
    source: str
    amount: float
    date: date_type
    notes: Optional[str] = None

    class Config:
        from_attributes = True