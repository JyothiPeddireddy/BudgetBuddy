from pydantic import BaseModel, Field
from datetime import date as date_type, datetime
from typing import Optional
from enum import Enum

class GoalStatus(str, Enum):
    in_progress = "in_progress"
    completed = "completed"

class SavingsGoalBase(BaseModel):
    title: str
    target_amount: float = Field(gt=0)
    target_date: date_type  # <-- CHANGED: mandatory now (was Optional[date_type] = None)
    icon: str = "laptop"

class SavingsGoalCreate(SavingsGoalBase):
    pass

class SavingsGoalUpdate(BaseModel):
    title: Optional[str] = None
    target_amount: Optional[float] = Field(default=None, gt=0)
    current_amount: Optional[float] = Field(default=None, ge=0)
    target_date: Optional[date_type] = None  # stays optional -- partial update semantics
    status: Optional[GoalStatus] = None
    icon: Optional[str] = None

class SavingsGoalContribute(BaseModel):
    account_id: int
    amount: float = Field(gt=0)

class SavingsGoalOut(BaseModel):
    id: int
    user_id: int
    title: str
    target_amount: float
    current_amount: float
    target_date: Optional[date_type] = None
    status: GoalStatus
    icon: str
    created_at: datetime

    class Config:
        from_attributes = True