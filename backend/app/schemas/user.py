from pydantic import BaseModel, EmailStr


class RegisterUser(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginUser(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
