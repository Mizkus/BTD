from sqlalchemy import Column, Float, Integer, String, Text
from database import Base


class Space(Base):
  __tablename__ = "spaces"

  id = Column(Integer, primary_key=True, index=True)
  name = Column(String(128), unique=True, nullable=False)


class TextEmbedding(Base):
  __tablename__ = "texts"

  id = Column(Integer, primary_key=True, index=True)
  short_name = Column(String(255))
  content = Column(Text, nullable=False)
  space = Column(String(128), nullable=False, default="default")
  x = Column(Float)
  y = Column(Float)
  embedding_json = Column(Text)
