from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.budget import BudgetCreate, BudgetUpdate, BudgetOut
from app.crud.budget import (
    create_budget, get_budgets_by_user, get_budget,
    update_budget, delete_budget,
)
from app.core.deps import get_current_user

router = APIRouter()

@router.post("/", response_model=BudgetOut)
def add_budget(budget_in: BudgetCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return create_budget(db, current_user.id, budget_in)

@router.get("/", response_model=list[BudgetOut])
def list_budgets(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return get_budgets_by_user(db, current_user.id)

@router.get("/{budget_id}", response_model=BudgetOut)
def get_single_budget(budget_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    budget = get_budget(db, budget_id, current_user.id)
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    return budget

@router.put("/{budget_id}", response_model=BudgetOut)
def edit_budget(budget_id: int, budget_in: BudgetUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    budget = update_budget(db, budget_id, current_user.id, budget_in)
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    return budget

@router.delete("/{budget_id}")
def remove_budget(budget_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    deleted = delete_budget(db, budget_id, current_user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Budget not found")
    return {"message": "Budget deleted"}