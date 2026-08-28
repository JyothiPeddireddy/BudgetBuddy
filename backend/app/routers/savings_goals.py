from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.deps import get_current_user
from app.schemas.savings_goal import SavingsGoalCreate, SavingsGoalUpdate, SavingsGoalOut, SavingsGoalContribute
from app.crud.savings_goal import (
    create_goal, get_goals_by_user, get_goal, update_goal, delete_goal, contribute_to_goal,
)
from app.crud.notification import create_notification

router = APIRouter()

@router.post("/", response_model=SavingsGoalOut)
def add_goal(goal_in: SavingsGoalCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return create_goal(db, current_user.id, goal_in)

@router.get("/", response_model=list[SavingsGoalOut])
def list_goals(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return get_goals_by_user(db, current_user.id)

@router.get("/{goal_id}", response_model=SavingsGoalOut)
def get_single_goal(goal_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    goal = get_goal(db, goal_id, current_user.id)
    if not goal:
        raise HTTPException(status_code=404, detail="Savings goal not found")
    return goal

@router.put("/{goal_id}", response_model=SavingsGoalOut)
def edit_goal(goal_id: int, goal_in: SavingsGoalUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    goal = update_goal(db, goal_id, current_user.id, goal_in)
    if not goal:
        raise HTTPException(status_code=404, detail="Savings goal not found")
    return goal

@router.delete("/{goal_id}")
def remove_goal(goal_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    deleted = delete_goal(db, goal_id, current_user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Savings goal not found")
    return {"message": "Savings goal deleted"}

@router.patch("/{goal_id}/contribute", response_model=SavingsGoalOut)
def contribute(
    goal_id: int,
    contribution: SavingsGoalContribute,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    result = contribute_to_goal(db, goal_id, current_user.id, contribution.account_id, contribution.amount)

    if result == "not_found":
        raise HTTPException(status_code=404, detail="Savings goal not found")
    if result == "invalid_account":
        raise HTTPException(status_code=404, detail="Account not found")
    if result == "insufficient_funds":
        raise HTTPException(status_code=400, detail="Insufficient funds in the selected account")

    goal, previous_amount = result

    target = float(goal.target_amount)
    prev_pct = (float(previous_amount) / target) * 100 if target else 0
    new_pct = (float(goal.current_amount) / target) * 100 if target else 0

    milestones = [
        (100, f"You completed your savings goal '{goal.title}'!"),
        (75, f"You're 75% of the way to your savings goal '{goal.title}'!"),
        (50, f"You're halfway to your savings goal '{goal.title}'!"),
        (25, f"You're 25% of the way to your savings goal '{goal.title}'!"),
    ]
    for threshold, message in milestones:
        if prev_pct < threshold <= new_pct:
            create_notification(db, current_user.id, message, "goal_milestone")
            break  # only fire the highest threshold actually crossed this time

    return goal