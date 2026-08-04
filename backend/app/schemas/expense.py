from pydantic import BaseModel, Field
from datetime import date as date_type
from typing import Optional
from app.schemas.enums import ExpenseCategory

class ExpenseBase(BaseModel):
    category: ExpenseCategory
    amount: float = Field(gt=0, description="Must be greater than zero")
    description: Optional[str] = None
    date: date_type

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseUpdate(BaseModel):
    category: Optional[ExpenseCategory] = None
    amount: Optional[float] = Field(default=None, gt=0)
    description: Optional[str] = None
    date: Optional[date_type] = None

class ExpenseOut(ExpenseBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True