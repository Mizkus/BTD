"""create texts table

Revision ID: 0001_create_tables
Revises: 
Create Date: 2025-03-17 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "0001_create_tables"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "texts",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("short_name", sa.String(length=255), nullable=True),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("space", sa.String(length=128), nullable=False, server_default="demo"),
        sa.Column("x", sa.Float(), nullable=True),
        sa.Column("y", sa.Float(), nullable=True),
        sa.Column("embedding_json", sa.Text(), nullable=True),
        sa.Column("created_at", sa.TIMESTAMP(), server_default=sa.func.current_timestamp()),
    )


def downgrade():
    op.drop_table("texts")
