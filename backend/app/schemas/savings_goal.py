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
    target_date: Optional[date_type] = None

class SavingsGoalCreate(SavingsGoalBase):
    pass

class SavingsGoalUpdate(BaseModel):
    title: Optional[str] = None
    target_amount: Optional[float] = Field(default=None, gt=0)
    target_date: Optional[date_type] = None
    status: Optional[GoalStatus] = None

class SavingsGoalContribute(BaseModel):
    amount: float = Field(gt=0)

class SavingsGoalOut(BaseModel):
    id: int
    user_id: int
    title: str
    target_amount: float
    current_amount: float
    target_date: Optional[date_type] = None
    status: GoalStatus
    created_at: datetime

    class Config:
        from_attributes = True