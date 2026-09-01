from typing import AsyncGenerator, List, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.base import UserRole
from app.models.core_models import User, WorkerProfile, CustomerProfile, AdminProfile

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login",
    auto_error=False
)

async def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception

    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    # Query user from DB with eager loaded profiles
    try:
        query = (
            select(User)
            .where(User.id == user_id)
            .options(
                selectinload(User.worker_profile),
                selectinload(User.customer_profile),
                selectinload(User.admin_profile)
            )
        )
        result = await db.execute(query)
        user = result.scalar_one_or_none()
    except Exception:
        user = None

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User associated with token not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

def require_roles(allowed_roles: List[UserRole]):
    """Enforces strict backend Role-Based Access Control (RBAC)."""
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: User role '{current_user.role.value}' lacks authorization for this resource"
            )
        return current_user
    return role_checker
