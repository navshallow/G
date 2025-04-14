from .models import Course

def courses_processor(request):
    """Add courses to context for all templates."""
    return {'courses': Course.objects.all().order_by('-created_at')}
