from decimal import Decimal
from sqlalchemy.orm import Session
from app.models.income import Income
from app.models.account import Account
from app.schemas.income import IncomeCreate, IncomeUpdate

def create_income(db: Session, user_id: int, income_in: IncomeCreate):
    account = db.query(Account).filter(
        Account.id == income_in.account_id, Account.user_id == user_id
    ).first()
    if not account:
        return None

    income = Income(user_id=user_id, **income_in.model_dump())
    db.add(income)
    account.balance += Decimal(str(income_in.amount))
    db.commit()
    db.refresh(income)
    return income

def get_incomes_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return (
        db.query(Income)
        .filter(Income.user_id == user_id)
        .order_by(Income.date.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

def get_income(db: Session, income_id: int, user_id: int):
    return (
        db.query(Income)
        .filter(Income.id == income_id, Income.user_id == user_id)
        .first()
    )

def update_income(db: Session, income_id: int, user_id: int, income_in: IncomeUpdate):
    income = get_income(db, income_id, user_id)
    if not income:
        return "not_found"

    updates = income_in.model_dump(exclude_unset=True)
    new_account_id = updates.get("account_id", income.account_id)
    new_amount = Decimal(str(updates.get("amount", income.amount)))

    if new_account_id != income.account_id:
        new_account = db.query(Account).filter(
            Account.id == new_account_id, Account.user_id == user_id
        ).first()
        if not new_account:
            return "invalid_account"
    else:
        new_account = db.query(Account).filter(Account.id == income.account_id).first()

    old_account = db.query(Account).filter(Account.id == income.account_id).first()

    if old_account:
        old_account.balance -= income.amount

    if new_account:
        new_account.balance += new_amount

    for field, value in updates.items():
        setattr(income, field, value)

    db.commit()
    db.refresh(income)
    return income

def delete_income(db: Session, income_id: int, user_id: int) -> bool:
    income = get_income(db, income_id, user_id)
    if not income:
        return False
    account = db.query(Account).filter(Account.id == income.account_id).first()
    if account:
        account.balance -= income.amount
    db.delete(income)
    db.commit()
    return True