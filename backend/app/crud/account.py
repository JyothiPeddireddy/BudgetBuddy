from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.account import Account
from app.schemas.account import AccountCreate, AccountUpdate

def find_duplicate_account(db: Session, user_id: int, account_name: str, bank_name: str | None, exclude_id: int | None = None):
    """Case-insensitive check for an existing account with the same name + bank for this user."""
    normalized_bank = (bank_name or "").strip().lower()
    query = db.query(Account).filter(
        Account.user_id == user_id,
        func.lower(func.trim(Account.account_name)) == account_name.strip().lower(),
        func.lower(func.trim(func.coalesce(Account.bank_name, ""))) == normalized_bank,
    )
    if exclude_id is not None:
        query = query.filter(Account.id != exclude_id)
    return query.first()

def create_account(db: Session, user_id: int, account_in: AccountCreate):
    duplicate = find_duplicate_account(db, user_id, account_in.account_name, account_in.bank_name)
    if duplicate:
        return "duplicate"

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
        return "not_found"

    updates = account_in.model_dump(exclude_unset=True)
    new_name = updates.get("account_name", account.account_name)
    new_bank = updates.get("bank_name", account.bank_name)

    duplicate = find_duplicate_account(db, user_id, new_name, new_bank, exclude_id=account_id)
    if duplicate:
        return "duplicate"

    for field, value in updates.items():
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