"""
URL configuration for backend project.
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from core.views import (
    TreeViewSet,
    NodeViewSet,
    AIMessageViewSet,
    MeView,
    TreeInviteView,
)

router = routers.DefaultRouter()
router.register(r'trees', TreeViewSet, basename='tree')
router.register(r'nodes', NodeViewSet, basename='node')
router.register(r'ai-messages', AIMessageViewSet, basename='aimessage')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/me/', MeView.as_view(), name='me'),
    path('api/trees/<int:pk>/invite/', TreeInviteView.as_view(), name='tree-invite'),
    path('api/', include(router.urls)),
]
