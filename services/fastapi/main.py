from fastapi import FastAPI, Depends, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uuid

from config import settings
from dependencies import get_current_user, fetch_node_context, save_ai_message, check_rate_limit
from llm_client import get_llm_client

app = FastAPI(title="Study Tree AI Service")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:19006"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AIRequest(BaseModel):
    """Request model for AI generation."""
    additional_context: Optional[str] = None
    stream: bool = False


class AIResponse(BaseModel):
    """Response model for AI generation."""
    request_id: str
    response: str
    model_name: str
    tokens_in: int
    tokens_out: int


@app.get("/")
async def root():
    """Health check."""
    return {
        "service": "Study Tree AI Service",
        "status": "running",
        "ai_provider": settings.ai_provider
    }


@app.post("/ai/nodes/{node_id}/explain")
async def explain_node(
    node_id: int,
    request: AIRequest,
    current_user: dict = Depends(get_current_user)
):
    """Generate an explanation for a node."""
    return await generate_ai_response(
        node_id=node_id,
        message_type="explain",
        request=request,
        current_user=current_user
    )


@app.post("/ai/nodes/{node_id}/quiz")
async def quiz_node(
    node_id: int,
    request: AIRequest,
    current_user: dict = Depends(get_current_user)
):
    """Generate quiz questions for a node."""
    return await generate_ai_response(
        node_id=node_id,
        message_type="quiz",
        request=request,
        current_user=current_user
    )


@app.post("/ai/nodes/{node_id}/summarize")
async def summarize_node(
    node_id: int,
    request: AIRequest,
    current_user: dict = Depends(get_current_user)
):
    """Generate a summary for a node."""
    return await generate_ai_response(
        node_id=node_id,
        message_type="summarize",
        request=request,
        current_user=current_user
    )


async def generate_ai_response(
    node_id: int,
    message_type: str,
    request: AIRequest,
    current_user: dict
):
    """Core logic for AI generation."""
    
    user_id = current_user.get("user_id")
    
    # Rate limiting
    await check_rate_limit(user_id)
    
    # Fetch node context
    node_data = await fetch_node_context(node_id, user_id)
    
    # Build prompt based on type
    prompt = build_prompt(message_type, node_data, request.additional_context)
    
    # Generate response
    llm_client = get_llm_client(settings.ai_provider, settings.ai_api_key)
    
    request_id = str(uuid.uuid4())
    
    if request.stream:
        # Streaming response
        async def generate_stream():
            full_response = []
            async for chunk in await llm_client.generate(prompt, stream=True):
                full_response.append(chunk)
                yield f"data: {chunk}\n\n"
            
            # Save complete response to Django
            complete_response = "".join(full_response)
            await save_ai_message(
                node_id=node_id,
                message_type=message_type,
                prompt=prompt,
                response=complete_response,
                model_name=f"{settings.ai_provider}-stub",
                tokens_in=len(prompt.split()),
                tokens_out=len(complete_response.split()),
                user_id=user_id,
                request_id=request_id
            )
            
            yield f"data: [DONE]\n\n"
        
        return StreamingResponse(
            generate_stream(),
            media_type="text/event-stream"
        )
    else:
        # Non-streaming response
        response_text = await llm_client.generate(prompt, stream=False)
        
        # Save to Django
        ai_message = await save_ai_message(
            node_id=node_id,
            message_type=message_type,
            prompt=prompt,
            response=response_text,
            model_name=f"{settings.ai_provider}-stub",
            tokens_in=len(prompt.split()),
            tokens_out=len(response_text.split()),
            user_id=user_id,
            request_id=request_id
        )
        
        return AIResponse(
            request_id=request_id,
            response=response_text,
            model_name=f"{settings.ai_provider}-stub",
            tokens_in=len(prompt.split()),
            tokens_out=len(response_text.split())
        )


def build_prompt(message_type: str, node_data: dict, additional_context: Optional[str] = None) -> str:
    """Build prompt for AI generation."""
    
    title = node_data.get("title", "")
    user_notes = node_data.get("user_notes", "")
    
    context = f"Title: {title}\n"
    if user_notes:
        context += f"Notes: {user_notes}\n"
    if additional_context:
        context += f"Additional Context: {additional_context}\n"
    
    prompts = {
        "explain": f"""Please provide a detailed explanation of the following topic:

{context}

Provide a clear, comprehensive explanation suitable for learning and studying.""",
        
        "quiz": f"""Based on the following topic, generate 5 quiz questions to test understanding:

{context}

Format each question clearly with multiple choice options (A, B, C, D) and indicate the correct answer.""",
        
        "summarize": f"""Please provide a concise summary of the following:

{context}

Focus on the key points and main ideas."""
    }
    
    return prompts.get(message_type, context)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
