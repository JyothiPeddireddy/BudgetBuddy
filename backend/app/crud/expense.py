from sqlalchemy.orm import Session
from app.models.expense import Expense
from app.schemas.expense import ExpenseCreate, ExpenseUpdate

def create_expense(db: Session, user_id: int, expense_in: ExpenseCreate) -> Expense:
    expense = Expense(user_id=user_id, **expense_in.model_dump())
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense

def get_expenses_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return (
        db.query(Expense)
        .filter(Expense.user_id == user_id)
        .order_by(Expense.date.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

def get_expense(db: Session, expense_id: int, user_id: int):
    # Filters by BOTH id and user_id — prevents ID-guessing attacks
    return (
        db.query(Expense)
        .filter(Expense.id == expense_id, Expense.user_id == user_id)
        .first()
    )

def update_expense(db: Session, expense_id: int, user_id: int, expense_in: ExpenseUpdate):
    expense = get_expense(db, expense_id, user_id)
    if not expense:
        return None
    for field, value in expense_in.model_dump(exclude_unset=True).items():
        setattr(expense, field, value)
    db.commit()
    db.refresh(expense)
    return expense

def delete_expense(db: Session, expense_id: int, user_id: int) -> bool:
    expense = get_expense(db, expense_id, user_id)
    if not expense:
        return False
    db.delete(expense)
    db.commit()
    return True