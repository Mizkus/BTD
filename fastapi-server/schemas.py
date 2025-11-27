from pydantic import BaseModel, EmailStr

class PageCreate(BaseModel):
    name: str

class PageOut(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

class KPIUpdate(BaseModel):
    page_id: int
    seconds: int | None = None  # для /kpi/time

class KPIOut(BaseModel):
    page_id: int
    page_name: str
    visits: int
    total_time_seconds: int


class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: EmailStr
    role: str
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
