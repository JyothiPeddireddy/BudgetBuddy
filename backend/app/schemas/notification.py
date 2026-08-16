from pydantic import BaseModel
from datetime import datetime
from enum import Enum

class NotificationType(str, Enum):
    budget_alert = "budget_alert"
    savings_reminder = "savings_reminder"
    goal_milestone = "goal_milestone"
    monthly_report = "monthly_report"

class NotificationOut(BaseModel):
    id: int
    user_id: int
    message: str
    type: NotificationType
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True