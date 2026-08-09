from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.account import AccountCreate, AccountUpdate, AccountOut
from app.crud.account import (
    create_account, get_accounts_by_user, get_account,
    update_account, delete_account,
)
from app.core.deps import get_current_user

router = APIRouter()

@router.post("/", response_model=AccountOut)
def add_account(account_in: AccountCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return create_account(db, current_user.id, account_in)

@router.get("/", response_model=list[AccountOut])
def list_accounts(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return get_accounts_by_user(db, current_user.id)

@router.get("/{account_id}", response_model=AccountOut)
def get_single_account(account_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    account = get_account(db, account_id, current_user.id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account

@router.put("/{account_id}", response_model=AccountOut)
def edit_account(account_id: int, account_in: AccountUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    account = update_account(db, account_id, current_user.id, account_in)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account

@router.delete("/{account_id}")
def remove_account(account_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    deleted = delete_account(db, account_id, current_user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Account not found")
    return {"message": "Account deleted"}