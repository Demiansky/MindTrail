from django.contrib import admin
from .models import Tree, TreeMember, Node, AIMessage


@admin.register(Tree)
class TreeAdmin(admin.ModelAdmin):
    list_display = ['title', 'owner', 'visibility', 'created_at']
    list_filter = ['visibility', 'created_at']
    search_fields = ['title', 'owner__username']


@admin.register(TreeMember)
class TreeMemberAdmin(admin.ModelAdmin):
    list_display = ['tree', 'user', 'email', 'role', 'created_at']
    list_filter = ['role', 'created_at']
    search_fields = ['tree__title', 'user__username', 'email']


@admin.register(Node)
class NodeAdmin(admin.ModelAdmin):
    list_display = ['title', 'tree', 'parent', 'sibling_order', 'created_at']
    list_filter = ['tree', 'created_at']
    search_fields = ['title', 'user_notes']


@admin.register(AIMessage)
class AIMessageAdmin(admin.ModelAdmin):
    list_display = ['node', 'type', 'model_name', 'tokens_in', 'tokens_out', 'created_at']
    list_filter = ['type', 'created_at']
    search_fields = ['node__title', 'prompt', 'response']
