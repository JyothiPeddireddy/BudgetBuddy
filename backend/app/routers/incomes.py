from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.income import IncomeCreate, IncomeUpdate, IncomeOut
from app.crud.income import (
    create_income, get_incomes_by_user, get_income,
    update_income, delete_income,
)
from app.core.deps import get_current_user

router = APIRouter()

@router.post("/", response_model=IncomeOut)
def add_income(income_in: IncomeCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    income = create_income(db, current_user.id, income_in)
    if not income:
        raise HTTPException(status_code=404, detail="Account not found")
    return income

@router.get("/", response_model=list[IncomeOut])
def list_incomes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=500),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    return get_incomes_by_user(db, current_user.id, skip, limit)

@router.get("/{income_id}", response_model=IncomeOut)
def get_single_income(income_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    income = get_income(db, income_id, current_user.id)
    if not income:
        raise HTTPException(status_code=404, detail="Income not found")
    return income

@router.put("/{income_id}", response_model=IncomeOut)
def edit_income(income_id: int, income_in: IncomeUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    result = update_income(db, income_id, current_user.id, income_in)
    if result == "not_found":
        raise HTTPException(status_code=404, detail="Income not found")
    if result == "invalid_account":
        raise HTTPException(status_code=404, detail="Account not found")
    return result

@router.delete("/{income_id}")
def remove_income(income_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    deleted = delete_income(db, income_id, current_user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Income not found")
    return {"message": "Income deleted"}