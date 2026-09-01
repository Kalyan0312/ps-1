from pydantic import BaseModel, Field
from typing import Optional, Any, Dict
from datetime import datetime
from app.models.base import UserRole, UserStatus

class UserRegisterRequest(BaseModel):
    phone_number: str = Field(..., description="10-digit mobile number, e.g. 9876543210")
    full_name: str = Field(..., min_length=2, max_length=100)
    password: str = Field(..., min_length=6, description="Account password")
    role: UserRole = Field(default=UserRole.WORKER)
    email: Optional[str] = None
    preferred_language: str = Field(default="en")

class UserLoginRequest(BaseModel):
    phone_or_email: str = Field(..., description="Registered phone number or email")
    password: str = Field(..., description="Account password")

class UserResponse(BaseModel):
    id: str
    phone_number: str
    email: Optional[str] = None
    full_name: str
    role: UserRole
    status: UserStatus
    is_verified: bool
    preferred_language: str
    created_at: datetime
    profile_details: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse

class LogoutResponse(BaseModel):
    success: bool
    message: str
