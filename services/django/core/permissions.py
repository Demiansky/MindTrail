from rest_framework import permissions
from .models import TreeMember


class IsTreeMember(permissions.BasePermission):
    """Check if user is a member of the tree."""
    
    def has_object_permission(self, request, view, obj):
        # Get the tree from the object
        tree = getattr(obj, 'tree', obj)
        
        # Check if user is a member
        return TreeMember.objects.filter(
            tree=tree,
            user=request.user
        ).exists()


class CanEditTree(permissions.BasePermission):
    """Check if user can edit the tree (owner or editor)."""
    
    def has_object_permission(self, request, view, obj):
        # Get the tree from the object
        tree = getattr(obj, 'tree', obj)
        
        # Read permissions for all members
        if request.method in permissions.SAFE_METHODS:
            return TreeMember.objects.filter(
                tree=tree,
                user=request.user
            ).exists()
        
        # Write permissions only for owner/editor
        return TreeMember.objects.filter(
            tree=tree,
            user=request.user,
            role__in=['owner', 'editor']
        ).exists()


class IsTreeOwner(permissions.BasePermission):
    """Check if user is the owner of the tree."""
    
    def has_object_permission(self, request, view, obj):
        # Get the tree from the object
        tree = getattr(obj, 'tree', obj)
        
        return tree.owner == request.user
