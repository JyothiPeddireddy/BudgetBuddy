# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session
# from app.database import get_db
# from app.schemas.account import AccountCreate, AccountUpdate, AccountOut
# from app.crud.account import (
#     create_account, get_accounts_by_user, get_account,
#     update_account, delete_account,
# )
# from app.core.deps import get_current_user

# router = APIRouter()

# @router.post("/", response_model=AccountOut)
# def add_account(account_in: AccountCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
#     result = create_account(db, current_user.id, account_in)
#     if result == "duplicate":
#         raise HTTPException(status_code=400, detail="You already have an account with this name and bank.")
#     return result

# @router.get("/", response_model=list[AccountOut])
# def list_accounts(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
#     return get_accounts_by_user(db, current_user.id)

# @router.get("/{account_id}", response_model=AccountOut)
# def get_single_account(account_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
#     account = get_account(db, account_id, current_user.id)
#     if not account:
#         raise HTTPException(status_code=404, detail="Account not found")
#     return account

# @router.put("/{account_id}", response_model=AccountOut)
# def edit_account(account_id: int, account_in: AccountUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
#     result = update_account(db, account_id, current_user.id, account_in)
#     if result == "not_found":
#         raise HTTPException(status_code=404, detail="Account not found")
#     if result == "duplicate":
#         raise HTTPException(status_code=400, detail="You already have an account with this name and bank.")
#     return result

# @router.delete("/{account_id}")
# def remove_account(account_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
#     deleted = delete_account(db, account_id, current_user.id)
#     if not deleted:
#         raise HTTPException(status_code=404, detail="Account not found")
#     return {"message": "Account deleted"}




from datetime import date
from dateutil.relativedelta import relativedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from app.database import get_db
from app.schemas.account import AccountCreate, AccountUpdate, AccountOut
from app.crud.account import (
    create_account, get_accounts_by_user, get_account,
    update_account, delete_account,
)
from app.models.account import Account
from app.models.expense import Expense
from app.models.income import Income
from app.core.deps import get_current_user

router = APIRouter()

@router.post("/", response_model=AccountOut)
def add_account(account_in: AccountCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    result = create_account(db, current_user.id, account_in)
    if result == "duplicate":
        raise HTTPException(status_code=400, detail="You already have an account with this name and bank.")
    return result

@router.get("/", response_model=list[AccountOut])
def list_accounts(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return get_accounts_by_user(db, current_user.id)

@router.get("/trend")
def get_balance_trend(months: int = 6, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    accounts = get_accounts_by_user(db, current_user.id)
    current_total = sum(float(a.balance) for a in accounts)

    today = date.today()
    month_starts = []
    for i in range(months):
        m = today.replace(day=1) - relativedelta(months=i)
        month_starts.append(m)
    month_starts.reverse()  # oldest first

    # Net change (income - expenses) for each month, oldest first
    net_changes = []
    for m in month_starts:
        total_income = (
            db.query(func.sum(Income.amount))
            .filter(
                Income.user_id == current_user.id,
                extract("year", Income.date) == m.year,
                extract("month", Income.date) == m.month,
            )
            .scalar() or 0
        )
        total_expenses = (
            db.query(func.sum(Expense.amount))
            .filter(
                Expense.user_id == current_user.id,
                extract("year", Expense.date) == m.year,
                extract("month", Expense.date) == m.month,
            )
            .scalar() or 0
        )
        net_changes.append(float(total_income) - float(total_expenses))

    # Work backward from current_total to reconstruct each month's END balance
    end_balances = [None] * months
    end_balances[-1] = current_total
    for i in range(months - 2, -1, -1):
        end_balances[i] = end_balances[i + 1] - net_changes[i + 1]

    return [
        {"month": month_starts[i].strftime("%b"), "balance": round(end_balances[i], 2)}
        for i in range(months)
    ]

@router.get("/{account_id}", response_model=AccountOut)
def get_single_account(account_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    account = get_account(db, account_id, current_user.id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account

@router.put("/{account_id}", response_model=AccountOut)
def edit_account(account_id: int, account_in: AccountUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    result = update_account(db, account_id, current_user.id, account_in)
    if result == "not_found":
        raise HTTPException(status_code=404, detail="Account not found")
    if result == "duplicate":
        raise HTTPException(status_code=400, detail="You already have an account with this name and bank.")
    return result

@router.delete("/{account_id}")
def remove_account(account_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    deleted = delete_account(db, account_id, current_user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Account not found")
    return {"message": "Account deleted"}