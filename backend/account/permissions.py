from rest_framework.permissions import SAFE_METHODS, BasePermission


def has_role(request, *roles):
    user = request.user
    return bool(user and user.is_authenticated and user.role in roles)


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return has_role(request, 'ADMIN')


class IsInstructorOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return has_role(request, 'INSTRUCTOR', 'ADMIN')


class IsInstructorOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return has_role(request, 'INSTRUCTOR', 'ADMIN')