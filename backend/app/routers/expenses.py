from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.schemas.expense import ExpenseCreate, ExpenseUpdate, ExpenseOut
from app.crud.expense import (
    create_expense, get_expenses_by_user, get_expense,
    update_expense, delete_expense, get_total_spent_this_month,
)
from app.models.expense import Expense
from app.core.deps import get_current_user

from datetime import date
from sqlalchemy import extract
from app.models.income import Income
from typing import Optional
from app.crud.budget import get_budget_for_category
from app.crud.notification import create_notification, budget_alert_exists


router = APIRouter()

@router.post("/", response_model=ExpenseOut)
def add_expense(expense_in: ExpenseCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    expense = create_expense(db, current_user.id, expense_in)

    if expense == "account_not_found":
        raise HTTPException(status_code=404, detail="Account not found")
    if expense == "insufficient_funds":
        raise HTTPException(status_code=400, detail="Insufficient funds in the selected account")

    month_year = expense.date.strftime("%Y-%m")
    budget = get_budget_for_category(db, current_user.id, expense.category, month_year)
    if budget:
        total_spent = get_total_spent_this_month(
            db, current_user.id, expense.category, expense.date.year, expense.date.month
        )
        if total_spent > float(budget.monthly_limit):
            message = f"You've exceeded your {expense.category} budget for {month_year}"
            if not budget_alert_exists(db, current_user.id, message):
                create_notification(db, current_user.id, message, "budget_alert")

    return expense

@router.get("/", response_model=list[ExpenseOut])
def list_expenses(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=500),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    return get_expenses_by_user(db, current_user.id, skip, limit)

@router.get("/summary")
def expense_summary(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    rows = (
        db.query(Expense.category, func.sum(Expense.amount).label("total"))
        .filter(Expense.user_id == current_user.id)
        .group_by(Expense.category)
        .all()
    )
    return {category: float(total) for category, total in rows}


@router.get("/dashboard")
def get_dashboard(
    year: Optional[int] = None,
    month: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    expense_query = db.query(Expense).filter(Expense.user_id == current_user.id)
    income_query = db.query(Income).filter(Income.user_id == current_user.id)

    # Only apply date filtering if the user picked a specific month
    if year and month:
        expense_query = expense_query.filter(
            extract("year", Expense.date) == year,
            extract("month", Expense.date) == month,
        )
        income_query = income_query.filter(
            extract("year", Income.date) == year,
            extract("month", Income.date) == month,
        )

    total_expenses = (
        db.query(func.sum(Expense.amount))
        .filter(Expense.id.in_(expense_query.with_entities(Expense.id)))
        .scalar() or 0
    )
    total_income = (
        db.query(func.sum(Income.amount))
        .filter(Income.id.in_(income_query.with_entities(Income.id)))
        .scalar() or 0
    )

    top_categories = (
        db.query(Expense.category, func.sum(Expense.amount).label("total"))
        .filter(Expense.id.in_(expense_query.with_entities(Expense.id)))
        .group_by(Expense.category)
        .order_by(func.sum(Expense.amount).desc())
        .limit(3)
        .all()
    )

    recent_expenses = expense_query.order_by(Expense.date.desc()).limit(5).all()
    recent_incomes = income_query.order_by(Income.date.desc()).limit(5).all()

    recent_transactions = sorted(
        [
            {"type": "expense", "id": e.id, "category": e.category, "amount": float(e.amount), "date": str(e.date)}
            for e in recent_expenses
        ] + [
            {"type": "income", "id": i.id, "source": i.source, "amount": float(i.amount), "date": str(i.date)}
            for i in recent_incomes
        ],
        key=lambda t: t["date"],
        reverse=True,
    )[:5]

    return {
        "period": f"{year}-{month:02d}" if year and month else "all_time",
        "total_income": float(total_income),
        "total_expenses": float(total_expenses),
        "balance": float(total_income) - float(total_expenses),
        "top_categories": [{"category": c, "total": float(t)} for c, t in top_categories],
        "recent_transactions": recent_transactions,
    }

@router.get("/{expense_id}", response_model=ExpenseOut)
def get_single_expense(expense_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    expense = get_expense(db, expense_id, current_user.id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense

@router.put("/{expense_id}", response_model=ExpenseOut)
def edit_expense(expense_id: int, expense_in: ExpenseUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    result = update_expense(db, expense_id, current_user.id, expense_in)
    if result == "not_found":
        raise HTTPException(status_code=404, detail="Expense not found")
    if result == "invalid_account":
        raise HTTPException(status_code=404, detail="Account not found")
    if result == "insufficient_funds":
        raise HTTPException(status_code=400, detail="Insufficient funds in the selected account")
    return result

@router.delete("/{expense_id}")
def remove_expense(expense_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    deleted = delete_expense(db, expense_id, current_user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Expense not found")
    return {"message": "Expense deleted"}