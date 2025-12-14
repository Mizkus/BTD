from typing import List, Optional
from pydantic import BaseModel


class SpaceCreate(BaseModel):
  name: str


class SpaceOut(BaseModel):
  id: int
  name: str

  class Config:
    orm_mode = True


class TextBase(BaseModel):
  shortName: Optional[str] = None
  content: str
  space: Optional[str] = "default"


class TextCreate(TextBase):
  pass


class TextOut(BaseModel):
  id: int
  shortName: Optional[str]
  content: str
  space: str
  x: float
  y: float

  class Config:
    orm_mode = True


class Article(BaseModel):
  id: str
  title: str
  summary: str
  link: str
