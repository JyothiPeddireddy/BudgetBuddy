from decimal import Decimal
from sqlalchemy.orm import Session
from app.models.expense import Expense
from app.models.account import Account
from app.schemas.expense import ExpenseCreate, ExpenseUpdate
from sqlalchemy import extract, func

def create_expense(db: Session, user_id: int, expense_in: ExpenseCreate):
    """Returns 'account_not_found', 'insufficient_funds', or the created Expense."""
    account = db.query(Account).filter(
        Account.id == expense_in.account_id, Account.user_id == user_id
    ).first()
    if not account:
        return "account_not_found"

    amount = Decimal(str(expense_in.amount))
    if account.balance < amount:
        return "insufficient_funds"

    expense = Expense(user_id=user_id, **expense_in.model_dump())
    db.add(expense)
    account.balance -= amount
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
    return (
        db.query(Expense)
        .filter(Expense.id == expense_id, Expense.user_id == user_id)
        .first()
    )

def update_expense(db: Session, expense_id: int, user_id: int, expense_in: ExpenseUpdate):
    expense = get_expense(db, expense_id, user_id)
    if not expense:
        return "not_found"

    updates = expense_in.model_dump(exclude_unset=True)
    new_account_id = updates.get("account_id", expense.account_id)
    new_amount = Decimal(str(updates.get("amount", expense.amount)))

    if new_account_id != expense.account_id:
        new_account = db.query(Account).filter(
            Account.id == new_account_id, Account.user_id == user_id
        ).first()
        if not new_account:
            return "invalid_account"
    else:
        new_account = db.query(Account).filter(Account.id == expense.account_id).first()

    old_account = db.query(Account).filter(Account.id == expense.account_id).first()

    # Reverse the old deduction first, so the funds check below is accurate
    if old_account:
        old_account.balance += expense.amount

    if new_account and new_account.balance < new_amount:
        # Undo the reversal above before bailing out
        if old_account:
            old_account.balance -= expense.amount
        return "insufficient_funds"

    if new_account:
        new_account.balance -= new_amount

    for field, value in updates.items():
        setattr(expense, field, value)

    db.commit()
    db.refresh(expense)
    return expense

def delete_expense(db: Session, expense_id: int, user_id: int) -> bool:
    expense = get_expense(db, expense_id, user_id)
    if not expense:
        return False
    account = db.query(Account).filter(Account.id == expense.account_id).first()
    if account:
        account.balance += expense.amount
    db.delete(expense)
    db.commit()
    return True

def get_total_spent_this_month(db: Session, user_id: int, category: str, year: int, month: int) -> float:
    total = (
        db.query(func.sum(Expense.amount))
        .filter(
            Expense.user_id == user_id,
            Expense.category == category,
            extract("year", Expense.date) == year,
            extract("month", Expense.date) == month,
        )
        .scalar()
    )
    return float(total or 0)