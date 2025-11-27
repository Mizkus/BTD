from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from database import Base


class Page(Base):
    __tablename__ = "pages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)

    kpi = relationship("KPI", back_populates="page", uselist=False, cascade="all, delete-orphan")


class KPI(Base):
    __tablename__ = "kpi"

    id = Column(Integer, primary_key=True, index=True)
    page_id = Column(Integer, ForeignKey("pages.id"), unique=True, nullable=False)
    visits = Column(Integer, default=0)
    total_time_seconds = Column(Integer, default=0)

    page = relationship("Page", back_populates="kpi")
