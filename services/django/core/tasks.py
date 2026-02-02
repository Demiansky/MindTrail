from celery import shared_task
from .models import AIMessage, Node
import logging

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def generate_ai_response_task(self, node_id, message_type, prompt, user_id, request_id):
    """
    Celery task to generate AI response in the background.
    
    This is a placeholder for background AI generation.
    Currently, FastAPI handles AI generation inline.
    """
    try:
        logger.info(f"Starting AI generation for node {node_id}, type {message_type}")
        
        # Check if this request was already processed (idempotency)
        existing = AIMessage.objects.filter(request_id=request_id).first()
        if existing:
            logger.info(f"Request {request_id} already processed")
            return existing.id
        
        # In a real implementation, this would:
        # 1. Call LLM provider
        # 2. Stream/generate response
        # 3. Save to database
        
        # For now, create a placeholder
        node = Node.objects.get(id=node_id)
        ai_message = AIMessage.objects.create(
            node=node,
            type=message_type,
            prompt=prompt,
            response="Background task response (placeholder)",
            model_name="celery-worker",
            tokens_in=len(prompt.split()),
            tokens_out=10,
            request_id=request_id,
            created_by_id=user_id
        )
        
        logger.info(f"AI message {ai_message.id} created successfully")
        return ai_message.id
        
    except Exception as exc:
        logger.error(f"Error in AI generation task: {exc}")
        raise self.retry(exc=exc, countdown=60)


@shared_task
def cleanup_old_ai_messages():
    """
    Periodic task to clean up old AI messages.
    Can be configured with Celery Beat.
    """
    from django.utils import timezone
    from datetime import timedelta
    
    cutoff_date = timezone.now() - timedelta(days=90)
    deleted_count = AIMessage.objects.filter(created_at__lt=cutoff_date).delete()[0]
    
    logger.info(f"Cleaned up {deleted_count} old AI messages")
    return deleted_count
