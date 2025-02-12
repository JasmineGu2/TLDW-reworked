from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views  # Import views correctly
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView

urlpatterns = [
    # User Authentication Endpoints
    path('api/register/', views.register_view, name='register'),
    path('api/login/', views.login_view, name='login'),
    
    # PDF Generation Endpoints
    path('api/generate_pdf/', views.generate_pdf, name='generate_pdf'),  
    path('api/get_notes/', views.get_notes, name='get_notes'),  
    path('api/progress/result/<str:task_id>/', views.get_task_result, name='get_task_result'),

    # JWT Authentication Endpoints
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    path("api/concepts/", views.get_concepts, name="get_concepts"),
    path("api/concepts/add/", views.add_concept, name="add_concept"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)