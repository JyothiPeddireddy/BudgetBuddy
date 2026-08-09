from decimal import Decimal
from sqlalchemy.orm import Session
from app.models.expense import Expense
from app.models.account import Account
from app.schemas.expense import ExpenseCreate, ExpenseUpdate

def create_expense(db: Session, user_id: int, expense_in: ExpenseCreate):
    account = db.query(Account).filter(
        Account.id == expense_in.account_id, Account.user_id == user_id
    ).first()
    if not account:
        return None

    expense = Expense(user_id=user_id, **expense_in.model_dump())
    db.add(expense)
    account.balance -= Decimal(str(expense_in.amount))
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

    if old_account:
        old_account.balance += expense.amount

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