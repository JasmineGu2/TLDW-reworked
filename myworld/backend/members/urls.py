from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views  # Import views correctly

urlpatterns = [
    path('api/register/', views.register_view, name='register'),
    path('api/login/', views.login_view, name='login'),
    path('api/generate_pdf/', views.generate_pdf, name='generate_pdf'),  # FIXED: Added `views.`
    path('api/get_user_pdfs/', views.get_user_pdfs, name='get_user_pdfs'),  # FIXED: Added `views.`
]

# ✅ Ensure media files are served during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
