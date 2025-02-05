from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views  # Import views correctly
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView

urlpatterns = [
    # ✅ User Authentication Endpoints
    path('api/register/', views.register_view, name='register'),
    path('api/login/', views.login_view, name='login'),
    
    # ✅ PDF Generation Endpoints
    path('api/generate_pdf/', views.generate_pdf, name='generate_pdf'),  
    path('api/get_pdf/', views.get_user_pdfs, name='get_user_pdfs'),  
    
    # ✅ Task Progress Tracking (NEW)
    path('api/progress/<str:task_id>/', views.task_progress, name='task_progress'),

    # ✅ JWT Authentication Endpoints
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
]

# ✅ Ensure media files are served during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
