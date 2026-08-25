from enum import Enum

class ExpenseCategory(str, Enum):
    food = "Food"
    travel = "Travel"
    shopping = "Shopping"
    education = "Education"
    entertainment = "Entertainment"
    bills = "Bills"
    miscellaneous = "Miscellaneous"
    others = "Others"