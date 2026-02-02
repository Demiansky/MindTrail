from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Tree, TreeMember, Node, AIMessage


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class TreeMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = TreeMember
        fields = ['id', 'tree', 'user', 'email', 'role', 'created_at']
        read_only_fields = ['id', 'created_at']


class TreeSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    members = TreeMemberSerializer(many=True, read_only=True)
    node_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Tree
        fields = ['id', 'owner', 'title', 'visibility', 'members', 'node_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'owner', 'created_at', 'updated_at']
    
    def get_node_count(self, obj):
        return obj.nodes.count()
    
    def create(self, validated_data):
        # Set owner to current user
        validated_data['owner'] = self.context['request'].user
        tree = super().create(validated_data)
        
        # Create owner membership
        TreeMember.objects.create(
            tree=tree,
            user=tree.owner,
            role='owner'
        )
        
        return tree


class NodeSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    children = serializers.SerializerMethodField()
    
    class Meta:
        model = Node
        fields = [
            'id', 'tree', 'parent', 'title', 'user_notes', 'ai_notes',
            'sibling_order', 'created_by', 'created_by_username',
            'children', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']
    
    def get_children(self, obj):
        # Only include children IDs to avoid deep nesting
        return [child.id for child in obj.children.all()]
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class NodeDetailSerializer(NodeSerializer):
    """Detailed serializer with nested children for tree view."""
    children = serializers.SerializerMethodField()
    
    def get_children(self, obj):
        children = obj.children.all().order_by('sibling_order')
        return NodeDetailSerializer(children, many=True, context=self.context).data


class AIMessageSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    node_title = serializers.CharField(source='node.title', read_only=True)
    
    class Meta:
        model = AIMessage
        fields = [
            'id', 'node', 'node_title', 'type', 'prompt', 'response',
            'model_name', 'tokens_in', 'tokens_out', 'request_id',
            'created_by', 'created_by_username', 'created_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at']
    
    def create(self, validated_data):
        if 'created_by' not in validated_data:
            validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class TreeInviteSerializer(serializers.Serializer):
    email = serializers.EmailField()
    role = serializers.ChoiceField(choices=['editor', 'viewer'])
