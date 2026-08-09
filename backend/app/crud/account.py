from sqlalchemy.orm import Session
from app.models.account import Account
from app.schemas.account import AccountCreate, AccountUpdate

def create_account(db: Session, user_id: int, account_in: AccountCreate) -> Account:
    account = Account(user_id=user_id, **account_in.model_dump())
    db.add(account)
    db.commit()
    db.refresh(account)
    return account

def get_accounts_by_user(db: Session, user_id: int):
    return db.query(Account).filter(Account.user_id == user_id).all()

def get_account(db: Session, account_id: int, user_id: int):
    return (
        db.query(Account)
        .filter(Account.id == account_id, Account.user_id == user_id)
        .first()
    )

def update_account(db: Session, account_id: int, user_id: int, account_in: AccountUpdate):
    account = get_account(db, account_id, user_id)
    if not account:
        return None
    for field, value in account_in.model_dump(exclude_unset=True).items():
        setattr(account, field, value)
    db.commit()
    db.refresh(account)
    return account

def delete_account(db: Session, account_id: int, user_id: int) -> bool:
    account = get_account(db, account_id, user_id)
    if not account:
        return False
    db.delete(account)
    db.commit()
    return True