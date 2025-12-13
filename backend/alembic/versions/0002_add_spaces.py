"""add spaces table

Revision ID: 0002_add_spaces
Revises: 0001_create_tables
Create Date: 2025-12-13 06:00:00.000000
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "0002_add_spaces"
down_revision = "0001_create_tables"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "spaces",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("name", sa.String(length=128), nullable=False, unique=True),
    )


def downgrade():
    op.drop_table("spaces")
