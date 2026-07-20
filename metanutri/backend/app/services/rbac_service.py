from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.rbac import Role, Permission, UserRole, RolePermission
from typing import List, Optional

class RBACService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_role_by_name(self, name: str) -> Optional[Role]:
        result = await self.db.execute(select(Role).where(Role.name == name))
        return result.scalar_one_or_none()

    async def get_permission(self, resource: str, action: str) -> Optional[Permission]:
        result = await self.db.execute(
            select(Permission).where(Permission.resource == resource, Permission.action == action)
        )
        return result.scalar_one_or_none()

    async def user_has_permission(self, user_id: str, resource: str, action: str) -> bool:
        result = await self.db.execute(
            select(UserRole).where(UserRole.user_id == user_id)
        )
        user_roles = result.scalars().all()
        
        if not user_roles:
            return False
        
        role_ids = [ur.role_id for ur in user_roles]
        
        result = await self.db.execute(
            select(RolePermission).where(RolePermission.role_id.in_(role_ids))
        )
        role_permissions = result.scalars().all()
        
        permission_ids = [rp.permission_id for rp in role_permissions]
        
        result = await self.db.execute(
            select(Permission).where(
                Permission.id.in_(permission_ids),
                Permission.resource == resource,
                Permission.action == action
            )
        )
        return result.scalar_one_or_none() is not None

    async def get_user_roles(self, user_id: str) -> List[Role]:
        result = await self.db.execute(
            select(UserRole).where(UserRole.user_id == user_id)
        )
        user_roles = result.scalars().all()
        
        role_ids = [ur.role_id for ur in user_roles]
        if not role_ids:
            return []
        
        result = await self.db.execute(
            select(Role).where(Role.id.in_(role_ids))
        )
        return result.scalars().all()

    async def assign_role_to_user(self, user_id: str, role_name: str) -> bool:
        role = await self.get_role_by_name(role_name)
        if not role:
            return False
        
        result = await self.db.execute(
            select(UserRole).where(UserRole.user_id == user_id, UserRole.role_id == role.id)
        )
        if result.scalar_one_or_none():
            return True
        
        user_role = UserRole(user_id=user_id, role_id=role.id)
        self.db.add(user_role)
        await self.db.commit()
        return True

    async def initialize_default_roles(self):
        default_roles = [
            {
                "name": "admin",
                "description": "Full system administrator",
                "permissions": [
                    ("user", "create"), ("user", "read"), ("user", "update"), ("user", "delete"),
                    ("genomic", "read"), ("genomic", "write"),
                    ("microbiome", "read"), ("microbiome", "write"),
                    ("food", "read"), ("food", "write"),
                    ("recommendation", "read"), ("recommendation", "write"),
                    ("dataset", "read"), ("dataset", "write"),
                    ("predict", "read"), ("predict", "write"),
                    ("role", "read"), ("role", "write")
                ]
            },
            {
                "name": "user",
                "description": "Regular user with basic access",
                "permissions": [
                    ("user", "read"), ("user", "update"),
                    ("genomic", "read"), ("genomic", "write"),
                    ("microbiome", "read"), ("microbiome", "write"),
                    ("food", "read"),
                    ("recommendation", "read"),
                    ("dataset", "read"),
                    ("predict", "read")
                ]
            },
            {
                "name": "guest",
                "description": "Read-only guest access",
                "permissions": [
                    ("food", "read"),
                    ("dataset", "read")
                ]
            }
        ]

        for role_data in default_roles:
            role = await self.get_role_by_name(role_data["name"])
            if not role:
                role = Role(name=role_data["name"], description=role_data["description"])
                self.db.add(role)
                await self.db.commit()
                await self.db.refresh(role)
            
            for resource, action in role_data["permissions"]:
                permission = await self.get_permission(resource, action)
                if not permission:
                    permission = Permission(
                        name=f"{resource}_{action}",
                        description=f"{action} access to {resource}",
                        resource=resource,
                        action=action
                    )
                    self.db.add(permission)
                    await self.db.commit()
                    await self.db.refresh(permission)
                
                result = await self.db.execute(
                    select(RolePermission).where(
                        RolePermission.role_id == role.id,
                        RolePermission.permission_id == permission.id
                    )
                )
                if not result.scalar_one_or_none():
                    rp = RolePermission(role_id=role.id, permission_id=permission.id)
                    self.db.add(rp)
                    await self.db.commit()

def check_permission(resource: str, action: str):
    from fastapi import Depends, HTTPException, status
    from app.core.security import get_current_active_user
    
    async def permission_checker(current_user = Depends(get_current_active_user)):
        from app.db.session import get_db
        
        async for db in get_db():
            rbac = RBACService(db)
            has_permission = await rbac.user_has_permission(str(current_user.id), resource, action)
            if not has_permission:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Not authorized to {action} {resource}"
                )
        return current_user
    
    return permission_checker