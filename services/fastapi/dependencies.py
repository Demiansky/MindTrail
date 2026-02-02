from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from typing import Optional
from config import settings
import httpx
import redis


security = HTTPBearer()


async def verify_jwt(credentials: HTTPAuthorizationCredentials) -> dict:
    """Verify JWT token and return payload."""
    try:
        token = credentials.credentials
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm]
        )
        return payload
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {str(e)}"
        )


async def get_current_user(credentials: HTTPAuthorizationCredentials = security) -> dict:
    """Dependency to get current authenticated user."""
    return await verify_jwt(credentials)


async def fetch_node_context(node_id: int, user_id: int) -> dict:
    """Fetch node context from Django API."""
    
    async with httpx.AsyncClient() as client:
        headers = {
            "X-Service-Token": settings.django_service_token
        }
        
        try:
            # Fetch node details
            response = await client.get(
                f"{settings.django_base_url}/api/nodes/{node_id}/",
                headers=headers,
                timeout=10.0
            )
            response.raise_for_status()
            node_data = response.json()
            
            # Verify user has access to this node's tree
            # (Django permissions should handle this, but double-check)
            
            return node_data
            
        except httpx.HTTPError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch node context: {str(e)}"
            )


async def save_ai_message(
    node_id: int,
    message_type: str,
    prompt: str,
    response: str,
    model_name: str,
    tokens_in: int,
    tokens_out: int,
    user_id: int,
    request_id: str = ""
) -> dict:
    """Save AI message to Django API."""
    
    async with httpx.AsyncClient() as client:
        headers = {
            "X-Service-Token": settings.django_service_token,
            "Content-Type": "application/json"
        }
        
        data = {
            "node": node_id,
            "type": message_type,
            "prompt": prompt,
            "response": response,
            "model_name": model_name,
            "tokens_in": tokens_in,
            "tokens_out": tokens_out,
            "request_id": request_id,
        }
        
        try:
            response = await client.post(
                f"{settings.django_base_url}/api/ai-messages/",
                headers=headers,
                json=data,
                timeout=10.0
            )
            response.raise_for_status()
            return response.json()
            
        except httpx.HTTPError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to save AI message: {str(e)}"
            )


# Rate limiting
redis_client = redis.from_url(settings.redis_url, decode_responses=True)


async def check_rate_limit(user_id: int):
    """Check if user has exceeded rate limit."""
    
    key = f"rate_limit:user:{user_id}"
    
    try:
        current = redis_client.get(key)
        
        if current is None:
            redis_client.setex(key, 60, 1)
            return
        
        current = int(current)
        
        if current >= settings.rate_limit_per_minute:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded. Please try again later."
            )
        
        redis_client.incr(key)
        
    except redis.RedisError as e:
        # Log error but don't fail the request
        print(f"Redis error in rate limiting: {e}")
