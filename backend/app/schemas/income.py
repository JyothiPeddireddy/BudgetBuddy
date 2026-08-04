from pydantic import BaseModel, Field
from datetime import date as date_type
from typing import Optional

class IncomeBase(BaseModel):
    source: str
    amount: float = Field(gt=0)
    date: date_type
    notes: Optional[str] = None

class IncomeCreate(IncomeBase):
    pass

class IncomeUpdate(BaseModel):
    source: Optional[str] = None
    amount: Optional[float] = Field(default=None, gt=0)
    date: Optional[date_type] = None
    notes: Optional[str] = None

class IncomeOut(IncomeBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True