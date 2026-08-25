from datetime import date
from sqlalchemy import func, extract
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.deps import get_current_user
from app.schemas.notification import NotificationOut
from app.crud.notification import get_notifications_by_user, mark_notification_read, mark_all_read, create_notification, delete_notification
from app.models.expense import Expense
from app.models.income import Income

router = APIRouter()

@router.get("/", response_model=list[NotificationOut])
def list_notifications(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return get_notifications_by_user(db, current_user.id)

@router.patch("/read-all")
def read_all_notifications(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    count = mark_all_read(db, current_user.id)
    return {"message": f"Marked {count} notifications as read"}

@router.patch("/{notification_id}/read", response_model=NotificationOut)
def read_notification(notification_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    notification = mark_notification_read(db, notification_id, current_user.id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notification

@router.post("/generate-monthly-report", response_model=NotificationOut)
def generate_monthly_report(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    today = date.today()
    year, month = today.year, today.month

    total_expenses = (
        db.query(func.sum(Expense.amount))
        .filter(Expense.user_id == current_user.id, extract("year", Expense.date) == year, extract("month", Expense.date) == month)
        .scalar() or 0
    )
    total_income = (
        db.query(func.sum(Income.amount))
        .filter(Income.user_id == current_user.id, extract("year", Income.date) == year, extract("month", Income.date) == month)
        .scalar() or 0
    )
    balance = float(total_income) - float(total_expenses)
    message = f"{today.strftime('%B %Y')} report: Income {float(total_income):.2f}, Expenses {float(total_expenses):.2f}, Balance {balance:.2f}"
    return create_notification(db, current_user.id, message, "monthly_report")

@router.delete("/{notification_id}")
def remove_notification(notification_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    deleted = delete_notification(db, notification_id, current_user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification deleted"}