from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from django.db.models import Q

from .models import Tree, TreeMember, Node, AIMessage
from .serializers import (
    TreeSerializer,
    TreeMemberSerializer,
    NodeSerializer,
    NodeDetailSerializer,
    AIMessageSerializer,
    UserSerializer,
    TreeInviteSerializer,
)
from .permissions import IsTreeMember, CanEditTree, IsTreeOwner


class MeView(generics.RetrieveAPIView):
    """Get current user info."""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class TreeViewSet(viewsets.ModelViewSet):
    """ViewSet for Tree CRUD."""
    serializer_class = TreeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return trees where user is a member."""
        user = self.request.user
        return Tree.objects.filter(
            members__user=user
        ).distinct()
    
    def get_permissions(self):
        """Use different permissions for different actions."""
        if self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated, CanEditTree]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    @action(detail=True, methods=['get'])
    def nodes(self, request, pk=None):
        """Get all nodes for a tree as nested structure."""
        tree = self.get_object()
        
        # Get root nodes (no parent)
        root_nodes = tree.nodes.filter(parent__isnull=True)
        serializer = NodeDetailSerializer(root_nodes, many=True, context={'request': request})
        
        return Response(serializer.data)


class TreeInviteView(generics.GenericAPIView):
    """Invite a user to a tree."""
    serializer_class = TreeInviteSerializer
    permission_classes = [IsAuthenticated, IsTreeOwner]
    queryset = Tree.objects.all()
    
    def post(self, request, pk):
        tree = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        role = serializer.validated_data['role']
        
        # Check if user exists
        try:
            user = User.objects.get(email=email)
            member, created = TreeMember.objects.get_or_create(
                tree=tree,
                user=user,
                defaults={'role': role}
            )
        except User.DoesNotExist:
            # Create invite by email
            member, created = TreeMember.objects.get_or_create(
                tree=tree,
                email=email,
                defaults={'role': role}
            )
        
        if not created:
            return Response(
                {'detail': 'User already a member of this tree.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response(
            TreeMemberSerializer(member).data,
            status=status.HTTP_201_CREATED
        )


class NodeViewSet(viewsets.ModelViewSet):
    """ViewSet for Node CRUD."""
    serializer_class = NodeSerializer
    permission_classes = [IsAuthenticated, CanEditTree]
    
    def get_queryset(self):
        """Return nodes from trees where user is a member."""
        user = self.request.user
        return Node.objects.filter(
            tree__members__user=user
        ).distinct()
    
    def perform_create(self, serializer):
        """Ensure user can edit the tree before creating node."""
        tree = serializer.validated_data['tree']
        
        # Check if user can edit
        member = TreeMember.objects.filter(
            tree=tree,
            user=self.request.user,
            role__in=['owner', 'editor']
        ).first()
        
        if not member:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You don't have permission to add nodes to this tree.")
        
        serializer.save()


class AIMessageViewSet(viewsets.ModelViewSet):
    """ViewSet for AIMessage CRUD."""
    serializer_class = AIMessageSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return AI messages from nodes in trees where user is a member."""
        user = self.request.user
        return AIMessage.objects.filter(
            node__tree__members__user=user
        ).distinct()
    
    def perform_create(self, serializer):
        """Save AI message with current user."""
        # Check if request has service token (from FastAPI)
        service_token = self.request.META.get('HTTP_X_SERVICE_TOKEN')
        
        if service_token == getattr(self.request, '_service_token_valid', False):
            # Service token is valid, allow creation
            serializer.save()
        else:
            # Regular user creation
            serializer.save(created_by=self.request.user)
