from typing import Protocol, AsyncIterator
import json


class LLMClient(Protocol):
    """Protocol for LLM providers."""
    
    async def generate(
        self,
        prompt: str,
        stream: bool = False
    ) -> AsyncIterator[str] | str:
        """Generate AI response."""
        ...


class StubLLMClient:
    """Stub implementation for testing without real API keys."""
    
    async def generate(
        self,
        prompt: str,
        stream: bool = False
    ) -> AsyncIterator[str] | str:
        """Generate a stub response."""
        
        response_text = f"""This is a stub AI response for your prompt.

**Prompt received:** {prompt[:100]}...

In a production environment, this would call a real AI provider like OpenAI or Anthropic.

**Key points:**
1. The system is working correctly
2. Replace the stub with a real provider
3. Configure AI_PROVIDER and AI_API_KEY environment variables

**Example response structure:**
- Clear explanations
- Step-by-step breakdowns
- Relevant examples
"""
        
        if stream:
            async def stream_response():
                words = response_text.split()
                for i, word in enumerate(words):
                    if i > 0:
                        yield " "
                    yield word
                    
            return stream_response()
        else:
            return response_text


class OpenAIClient:
    """OpenAI implementation (placeholder)."""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
    
    async def generate(
        self,
        prompt: str,
        stream: bool = False
    ) -> AsyncIterator[str] | str:
        """Generate using OpenAI."""
        # TODO: Implement OpenAI integration
        # from openai import AsyncOpenAI
        raise NotImplementedError("OpenAI integration not yet implemented")


def get_llm_client(provider: str, api_key: str = "") -> LLMClient:
    """Factory function to get the appropriate LLM client."""
    
    if provider == "stub":
        return StubLLMClient()
    elif provider == "openai":
        if not api_key:
            raise ValueError("OpenAI API key required")
        return OpenAIClient(api_key)
    else:
        raise ValueError(f"Unknown AI provider: {provider}")
