from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings."""
    
    # Django Integration
    django_base_url: str = "http://django:8000"
    django_service_token: str = "service-token-change-in-prod"
    
    # JWT Settings
    jwt_secret_key: str = "jwt-secret-key-change-in-prod"
    jwt_algorithm: str = "HS256"
    
    # Redis
    redis_url: str = "redis://redis:6379/0"
    
    # AI Provider
    ai_provider: str = "stub"  # stub, openai, anthropic
    ai_api_key: str = ""
    
    # Rate Limiting
    rate_limit_per_minute: int = 10
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
