from io import BytesIO
from datetime import date, datetime
from calendar import monthrange

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side

from app.database import get_db
from app.models.expense import Expense
from app.models.income import Income
from app.core.deps import get_current_user

router = APIRouter(
    prefix="/reports",
    tags=["Reports"],
)


def bank_label(item):
    """Returns the account's bank name, falling back to account name, then a placeholder."""
    account = getattr(item, "account", None)
    if not account:
        return "—"
    return account.bank_name or account.account_name or "—"


def get_month_data(
    month: int,
    year: int,
    db: Session,
    current_user,
):
    start_date = date(year, month, 1)

    last_day = monthrange(year, month)[1]

    end_date = date(
        year,
        month,
        last_day,
    )

    expenses = (
        db.query(Expense)
        .options(joinedload(Expense.account))
        .filter(
            Expense.user_id == current_user.id,
            Expense.date >= start_date,
            Expense.date <= end_date,
        )
        .order_by(Expense.date.asc())
        .all()
    )

    incomes = (
        db.query(Income)
        .options(joinedload(Income.account))
        .filter(
            Income.user_id == current_user.id,
            Income.date >= start_date,
            Income.date <= end_date,
        )
        .order_by(Income.date.asc())
        .all()
    )

    total_income = sum(
        float(item.amount or 0)
        for item in incomes
    )

    total_expenses = sum(
        float(item.amount or 0)
        for item in expenses
    )

    net_savings = (
        total_income - total_expenses
    )

    return (
        incomes,
        expenses,
        total_income,
        total_expenses,
        net_savings,
        start_date,
    )


# ============================================================
# PDF FINANCIAL REPORT
# ============================================================

@router.get("/export/pdf")
def export_pdf(
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=2000, le=2100),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    (
        incomes,
        expenses,
        total_income,
        total_expenses,
        net_savings,
        report_date,
    ) = get_month_data(
        month,
        year,
        db,
        current_user,
    )

    month_name = report_date.strftime(
        "%B %Y"
    )

    generated_at = datetime.now().strftime("%d %b %Y, %I:%M %p")

    buffer = BytesIO()

    document = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=40,
        rightMargin=40,
        topMargin=40,
        bottomMargin=40,
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Title"],
        fontSize=20,
        leading=24,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#071A3D"),
        spaceAfter=5,
    )

    subtitle_style = ParagraphStyle(
        "ReportSubtitle",
        parent=styles["Normal"],
        fontSize=11,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#64748B"),
        spaceAfter=8,
    )

    month_style = ParagraphStyle(
        "ReportMonth",
        parent=styles["Normal"],
        fontSize=13,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#10B981"),
        spaceAfter=4,
    )

    generated_style = ParagraphStyle(
        "GeneratedAt",
        parent=styles["Normal"],
        fontSize=9,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#94A3B8"),
        spaceAfter=20,
    )

    heading_style = ParagraphStyle(
        "ReportHeading",
        parent=styles["Heading2"],
        fontSize=13,
        leading=16,
        textColor=colors.HexColor("#071A3D"),
        spaceBefore=16,
        spaceAfter=8,
    )

    story = []

    # --------------------------------------------------------
    # HEADER
    # --------------------------------------------------------

    story.append(Paragraph("BUDGET BUDDY", title_style))
    story.append(Paragraph("FINANCIAL REPORT", subtitle_style))
    story.append(Paragraph(month_name, month_style))
    story.append(Paragraph(f"Generated on {generated_at}", generated_style))

    # --------------------------------------------------------
    # SUMMARY
    # --------------------------------------------------------

    story.append(
        Paragraph(
            "Financial Summary",
            heading_style,
        )
    )

    summary_data = [
        [
            "Total Income",
            "Total Expenses",
            "Net Savings",
        ],
        [
            f"Rs. {total_income:,.2f}",
            f"Rs. {total_expenses:,.2f}",
            f"Rs. {net_savings:,.2f}",
        ],
    ]

    summary_table = Table(
        summary_data,
        colWidths=[
            170,
            170,
            170,
        ],
    )

    summary_table.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, 0),
                    colors.HexColor("#F1F5F9"),
                ),
                (
                    "FONTNAME",
                    (0, 0),
                    (-1, 0),
                    "Helvetica-Bold",
                ),
                (
                    "FONTNAME",
                    (0, 1),
                    (-1, 1),
                    "Helvetica-Bold",
                ),
                (
                    "TEXTCOLOR",
                    (0, 1),
                    (0, 1),
                    colors.HexColor("#10B981"),
                ),
                (
                    "TEXTCOLOR",
                    (1, 1),
                    (1, 1),
                    colors.HexColor("#EF4444"),
                ),
                (
                    "TEXTCOLOR",
                    (2, 1),
                    (2, 1),
                    colors.HexColor("#10B981"),
                ),
                (
                    "ALIGN",
                    (0, 0),
                    (-1, -1),
                    "CENTER",
                ),
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.HexColor("#CBD5E1"),
                ),
                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    10,
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    10,
                ),
            ]
        )
    )

    story.append(summary_table)

    # --------------------------------------------------------
    # INCOME REPORT
    # --------------------------------------------------------

    story.append(
        Paragraph(
            "Income Report",
            heading_style,
        )
    )

    income_rows = [
        [
            "Date",
            "Source",
            "Bank",
            "Amount (INR)",
        ]
    ]

    for item in incomes:
        income_rows.append(
            [
                item.date.strftime("%Y-%m-%d"),
                item.source or "Income",
                bank_label(item),
                f"Rs. {float(item.amount or 0):,.2f}",
            ]
        )

    income_rows.append(
        [
            "",
            "TOTAL INCOME",
            "",
            f"Rs. {total_income:,.2f}",
        ]
    )

    income_table = Table(
        income_rows,
        colWidths=[
            90,
            170,
            110,
            120,
        ],
        repeatRows=1,
    )

    income_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#10B981")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
                ("TEXTCOLOR", (3, -1), (3, -1), colors.HexColor("#10B981")),
                ("ALIGN", (3, 1), (3, -1), "RIGHT"),
                ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#CBD5E1")),
                ("ROWBACKGROUNDS", (0, 1), (-1, -2), [colors.white, colors.HexColor("#F8FAFC")]),
                ("TOPPADDING", (0, 0), (-1, -1), 7),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
            ]
        )
    )

    story.append(income_table)

    # --------------------------------------------------------
    # EXPENSE REPORT
    # --------------------------------------------------------

    story.append(
        Paragraph(
            "Expense Report",
            heading_style,
        )
    )

    expense_rows = [
        [
            "Date",
            "Category",
            "Bank",
            "Amount (INR)",
        ]
    ]

    for item in expenses:
        expense_rows.append(
            [
                item.date.strftime("%Y-%m-%d"),
                item.category or "Miscellaneous",
                bank_label(item),
                f"Rs. {float(item.amount or 0):,.2f}",
            ]
        )

    expense_rows.append(
        [
            "",
            "TOTAL EXPENSES",
            "",
            f"Rs. {total_expenses:,.2f}",
        ]
    )

    expense_table = Table(
        expense_rows,
        colWidths=[
            90,
            170,
            110,
            120,
        ],
        repeatRows=1,
    )

    expense_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#EF4444")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
                ("TEXTCOLOR", (3, -1), (3, -1), colors.HexColor("#EF4444")),
                ("ALIGN", (3, 1), (3, -1), "RIGHT"),
                ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#CBD5E1")),
                ("ROWBACKGROUNDS", (0, 1), (-1, -2), [colors.white, colors.HexColor("#F8FAFC")]),
                ("TOPPADDING", (0, 0), (-1, -1), 7),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
            ]
        )
    )

    story.append(expense_table)

    story.append(Spacer(1, 20))

    story.append(
        Paragraph(
            "All amounts are in Indian Rupees (Rs.).",
            ParagraphStyle(
                "Footer",
                parent=styles["Normal"],
                fontSize=8,
                alignment=TA_CENTER,
                textColor=colors.HexColor("#64748B"),
            ),
        )
    )

    document.build(story)

    buffer.seek(0)

    filename = (
        f"budget-buddy-financial-report-"
        f"{year}-{month:02d}.pdf"
    )

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition":
                f'attachment; filename="{filename}"'
        },
    )


# ============================================================
# EXCEL FINANCIAL REPORT
# ============================================================

@router.get("/export/excel")
def export_excel(
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=2000, le=2100),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    (
        incomes,
        expenses,
        total_income,
        total_expenses,
        net_savings,
        report_date,
    ) = get_month_data(
        month,
        year,
        db,
        current_user,
    )

    month_name = report_date.strftime("%B %Y")
    generated_at = datetime.now().strftime("%d %b %Y, %I:%M %p")

    workbook = Workbook()

    # ========================================================
    # FINANCIAL SUMMARY
    # ========================================================

    summary = workbook.active
    summary.title = "Financial Summary"

    summary["A1"] = "BUDGET BUDDY"
    summary["A1"].font = Font(bold=True, size=20)

    summary["A2"] = "FINANCIAL REPORT"
    summary["A2"].font = Font(bold=True, size=14)

    summary["A3"] = month_name
    summary["A3"].font = Font(bold=True, size=12)

    summary["A4"] = f"Generated on {generated_at}"
    summary["A4"].font = Font(italic=True, size=9, color="94A3B8")

    summary["A6"] = "Total Income"
    summary["B6"] = total_income

    summary["A7"] = "Total Expenses"
    summary["B7"] = total_expenses

    summary["A8"] = "Net Savings"
    summary["B8"] = net_savings

    summary["A10"] = "See 'Income Report' and 'Expense Report' tabs for the full itemized breakdown."
    summary["A10"].font = Font(italic=True, size=10, color="64748B")

    for cell in ["A6", "A7", "A8"]:
        summary[cell].font = Font(bold=True)

    for cell in ["B6", "B7", "B8"]:
        summary[cell].font = Font(bold=True)
        summary[cell].number_format = '₹#,##0.00'

    summary.column_dimensions["A"].width = 30
    summary.column_dimensions["B"].width = 25

    # ========================================================
    # INCOME REPORT
    # ========================================================

    income_sheet = workbook.create_sheet("Income Report")

    income_sheet.append(["Date", "Source", "Bank", "Amount (INR)"])

    for item in incomes:
        income_sheet.append(
            [
                item.date,
                item.source or "Income",
                bank_label(item),
                float(item.amount or 0),
            ]
        )

    income_sheet.append(["", "TOTAL INCOME", "", total_income])

    # ========================================================
    # EXPENSE REPORT
    # ========================================================

    expense_sheet = workbook.create_sheet("Expense Report")

    expense_sheet.append(["Date", "Category", "Bank", "Amount (INR)"])

    for item in expenses:
        expense_sheet.append(
            [
                item.date,
                item.category or "Miscellaneous",
                bank_label(item),
                float(item.amount or 0),
            ]
        )

    expense_sheet.append(["", "TOTAL EXPENSES", "", total_expenses])

    # ========================================================
    # EXCEL FORMATTING
    # ========================================================

    header_fill = PatternFill("solid", fgColor="071A3D")
    header_font = Font(bold=True, color="FFFFFF")
    total_font = Font(bold=True)
    border = Border(bottom=Side(style="thin", color="CBD5E1"))

    for sheet in [income_sheet, expense_sheet]:

        for cell in sheet[1]:
            cell.fill = header_fill
            cell.font = header_font
            cell.alignment = Alignment(horizontal="center")

        for row in sheet.iter_rows():
            for cell in row:
                cell.border = border

        for cell in sheet["D"][1:]:
            cell.number_format = '₹#,##0.00'

        for cell in sheet[sheet.max_row]:
            cell.font = total_font

        sheet.column_dimensions["A"].width = 15
        sheet.column_dimensions["B"].width = 28
        sheet.column_dimensions["C"].width = 18
        sheet.column_dimensions["D"].width = 20

        sheet.freeze_panes = "A2"

    # ========================================================
    # CREATE EXCEL FILE
    # ========================================================

    buffer = BytesIO()
    workbook.save(buffer)
    buffer.seek(0)

    filename = (
        f"budget-buddy-financial-report-"
        f"{year}-{month:02d}.xlsx"
    )

    return StreamingResponse(
        buffer,
        media_type=(
            "application/vnd.openxmlformats-"
            "officedocument.spreadsheetml.sheet"
        ),
        headers={
            "Content-Disposition":
                f'attachment; filename="{filename}"'
        },
    )