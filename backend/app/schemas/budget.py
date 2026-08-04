from pydantic import BaseModel, Field
from typing import Optional
from app.schemas.enums import ExpenseCategory

class BudgetBase(BaseModel):
    category: ExpenseCategory
    monthly_limit: float = Field(gt=0)
    month_year: str = Field(pattern=r"^\d{4}-\d{2}$", description="Format: YYYY-MM")

class BudgetCreate(BudgetBase):
    pass

class BudgetUpdate(BaseModel):
    category: Optional[ExpenseCategory] = None
    monthly_limit: Optional[float] = Field(default=None, gt=0)
    month_year: Optional[str] = Field(default=None, pattern=r"^\d{4}-\d{2}$")

class BudgetOut(BudgetBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True