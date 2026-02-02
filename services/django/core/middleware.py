# Middleware to validate service token from FastAPI
from django.conf import settings


class ServiceTokenMiddleware:
    """Middleware to validate service tokens from internal services."""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Check for service token header
        service_token = request.META.get('HTTP_X_SERVICE_TOKEN')
        
        if service_token and service_token == settings.FASTAPI_SERVICE_TOKEN:
            request._service_token_valid = True
        
        response = self.get_response(request)
        return response
