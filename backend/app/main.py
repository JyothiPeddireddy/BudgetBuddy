import time
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.routers import auth, expenses, incomes, budgets, account, savings_goals, notifications, reports, analytics, profile, admin, subscription


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("budgetbuddy")

app = FastAPI(
    title="Budget Buddy API",
    version="1.0.0"
)

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(incomes.router, prefix="/incomes", tags=["Incomes"])
app.include_router(expenses.router, prefix="/expenses", tags=["Expenses"])
app.include_router(budgets.router, prefix="/budgets", tags=["Budgets"])
app.include_router(account.router, prefix="/accounts", tags=["Accounts"])
app.include_router(savings_goals.router, prefix="/goals", tags=["Savings Goals"])
app.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
app.include_router(reports.router)
app.include_router(analytics.router)
app.include_router(profile.router)
app.include_router(admin.router, tags=["Admin"])
app.include_router(subscription.router, tags=["Subscription"])

# Include both localhost and 127.0.0.1 variants for dev — browsers treat
# these as distinct origins even though they resolve to the same machine.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://budget-buddy-ten-theta.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = round((time.time() - start_time) * 1000, 2)
    logger.info(f"{request.method} {request.url.path} -> {response.status_code} ({duration}ms)")
    return response

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error on {request.url.path}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

@app.get("/")
def home():
    return {
        "message": "Welcome to Budget Buddy API"
    }