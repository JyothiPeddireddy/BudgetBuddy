"""add phone_number to profiles

Revision ID: 1725699648ed
Revises: 3a71639ce731
Create Date: 2026-09-11 16:05:12.941306

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1725699648ed'
down_revision: Union[str, None] = '3a71639ce731'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "profiles",
        sa.Column("phone_number", sa.String(), nullable=True)
    )


def downgrade() -> None:
    op.drop_column("profiles", "phone_number")