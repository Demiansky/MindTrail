from django.db import models
from django.contrib.auth.models import User


class Tree(models.Model):
    """A study tree owned by a user."""
    VISIBILITY_CHOICES = [
        ('private', 'Private'),
        ('shared', 'Shared'),
        ('public', 'Public'),
    ]
    
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_trees')
    title = models.CharField(max_length=255)
    visibility = models.CharField(max_length=10, choices=VISIBILITY_CHOICES, default='private')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title


class TreeMember(models.Model):
    """Members/collaborators on a tree."""
    ROLE_CHOICES = [
        ('owner', 'Owner'),
        ('editor', 'Editor'),
        ('viewer', 'Viewer'),
    ]
    
    tree = models.ForeignKey(Tree, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='tree_memberships')
    email = models.EmailField(null=True, blank=True)  # For invites
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = [['tree', 'user'], ['tree', 'email']]
    
    def __str__(self):
        user_identifier = self.user.username if self.user else self.email
        return f"{user_identifier} - {self.tree.title} ({self.role})"


class Node(models.Model):
    """A node in the study tree."""
    tree = models.ForeignKey(Tree, on_delete=models.CASCADE, related_name='nodes')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    title = models.CharField(max_length=500)
    user_notes = models.TextField(blank=True, default='')
    ai_notes = models.TextField(blank=True, default='')
    sibling_order = models.IntegerField(default=0)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_nodes')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['sibling_order']
    
    def __str__(self):
        return f"{self.tree.title} - {self.title}"


class AIMessage(models.Model):
    """AI-generated content for a node."""
    TYPE_CHOICES = [
        ('explain', 'Explain'),
        ('quiz', 'Quiz'),
        ('summarize', 'Summarize'),
    ]
    
    node = models.ForeignKey(Node, on_delete=models.CASCADE, related_name='ai_messages')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    prompt = models.TextField()
    response = models.TextField(blank=True, default='')
    model_name = models.CharField(max_length=100, blank=True, default='')
    tokens_in = models.IntegerField(default=0)
    tokens_out = models.IntegerField(default=0)
    request_id = models.CharField(max_length=100, blank=True, default='', db_index=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='ai_messages')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.node.title} - {self.type}"
