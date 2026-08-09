from pydantic import BaseModel, Field
from datetime import date as date_type
from typing import Optional
from app.schemas.enums import ExpenseCategory

class ExpenseBase(BaseModel):
    account_id: int
    category: ExpenseCategory
    amount: float = Field(gt=0)
    description: Optional[str] = None
    date: date_type

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseUpdate(BaseModel):
    account_id: Optional[int] = None
    category: Optional[ExpenseCategory] = None
    amount: Optional[float] = Field(default=None, gt=0)
    description: Optional[str] = None
    date: Optional[date_type] = None

class ExpenseOut(BaseModel):
    id: int
    user_id: int
    account_id: Optional[int] = None   # <-- optional here, so old NULL rows don't crash
    category: ExpenseCategory
    amount: float
    description: Optional[str] = None
    date: date_type

    class Config:
        from_attributes = True