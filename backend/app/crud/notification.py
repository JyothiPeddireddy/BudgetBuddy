from sqlalchemy.orm import Session

from app.models.notification import Notification


def create_notification(
    db: Session,
    user_id: int,
    message: str,
    type: str
) -> Notification:
    """
    Create a new notification.
    """
    notification = Notification(
        user_id=user_id,
        message=message,
        type=type
    )

    db.add(notification)
    db.commit()
    db.refresh(notification)

    return notification


def get_notifications_by_user(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 100
):
    """
    Get notifications belonging to a user.
    Newest notifications are returned first.
    """
    return (
        db.query(Notification)
        .filter(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def mark_notification_read(
    db: Session,
    notification_id: int,
    user_id: int
):
    """
    Mark a single notification as read.
    """
    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.user_id == user_id
        )
        .first()
    )

    if not notification:
        return None

    notification.is_read = True

    db.commit()
    db.refresh(notification)

    return notification


def mark_all_read(
    db: Session,
    user_id: int
) -> int:
    """
    Mark all unread notifications for a user as read.
    Returns the number of updated notifications.
    """
    updated = (
        db.query(Notification)
        .filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        )
        .update(
            {"is_read": True},
            synchronize_session=False
        )
    )

    db.commit()

    return updated


def delete_notification(
    db: Session,
    notification_id: int,
    user_id: int
) -> bool:
    """
    Delete a notification belonging to a user.
    """
    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.user_id == user_id
        )
        .first()
    )

    if not notification:
        return False

    db.delete(notification)
    db.commit()

    return True


def notification_exists(
    db: Session,
    user_id: int,
    notif_type: str,
    message: str
) -> bool:
    """
    Check whether a specific notification already exists
    for the user.

    The notification type and message are both used for
    deduplication.
    """
    return (
        db.query(Notification)
        .filter(
            Notification.user_id == user_id,
            Notification.type == notif_type,
            Notification.message == message
        )
        .first()
        is not None
    )


def budget_alert_exists(
    db: Session,
    user_id: int,
    message: str
) -> bool:
    """
    Kept for backward compatibility.

    New code should use notification_exists().
    """
    return notification_exists(
        db,
        user_id,
        "budget_alert",
        message
    )