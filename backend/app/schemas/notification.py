# from pydantic import BaseModel
# from datetime import datetime
# from enum import Enum

# class NotificationType(str, Enum):
#     budget_alert = "budget_alert"
#     budget_warning = "budget_warning"
#     savings_reminder = "savings_reminder"
#     goal_milestone = "goal_milestone"
#     monthly_report = "monthly_report"

# class NotificationOut(BaseModel):
#     id: int
#     user_id: int
#     message: str
#     type: NotificationType
#     is_read: bool
#     created_at: datetime

#     class Config:
#         from_attributes = True



from enum import Enum
from datetime import datetime

from pydantic import BaseModel


class NotificationType(str, Enum):
    budget_alert = "budget_alert"
    budget_warning = "budget_warning"
    savings_reminder = "savings_reminder"
    goal_milestone = "goal_milestone"
    monthly_report = "monthly_report"


class NotificationBase(BaseModel):
    message: str
    type: NotificationType


class NotificationCreate(NotificationBase):
    pass


class NotificationOut(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True