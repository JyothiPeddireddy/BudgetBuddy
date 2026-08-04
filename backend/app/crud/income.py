from sqlalchemy.orm import Session
from app.models.income import Income
from app.schemas.income import IncomeCreate, IncomeUpdate

def create_income(db: Session, user_id: int, income_in: IncomeCreate) -> Income:
    income = Income(user_id=user_id, **income_in.model_dump())
    db.add(income)
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
        return None
    for field, value in income_in.model_dump(exclude_unset=True).items():
        setattr(income, field, value)
    db.commit()
    db.refresh(income)
    return income

def delete_income(db: Session, income_id: int, user_id: int) -> bool:
    income = get_income(db, income_id, user_id)
    if not income:
        return False
    db.delete(income)
    db.commit()
    return True