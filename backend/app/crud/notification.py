from sqlalchemy.orm import Session
from app.models.notification import Notification

def create_notification(db: Session, user_id: int, message: str, type: str) -> Notification:
    notification = Notification(user_id=user_id, message=message, type=type)
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification

def get_notifications_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return (
        db.query(Notification)
        .filter(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

def mark_notification_read(db: Session, notification_id: int, user_id: int):
    notification = (
        db.query(Notification)
        .filter(Notification.id == notification_id, Notification.user_id == user_id)
        .first()
    )
    if not notification:
        return None
    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return notification

def budget_alert_exists(db: Session, user_id: int, message: str) -> bool:
    return (
        db.query(Notification)
        .filter(Notification.user_id == user_id, Notification.type == "budget_alert", Notification.message == message)
        .first() is not None
    )