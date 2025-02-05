from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.conf import settings
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny, IsAuthenticated
from celery.result import AsyncResult
from .models import GeneratedPDF
from .tasks import generate_pdf_task  # Import Celery task
from .pdf import *

# User Authentication Views
@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=400)

    user = User.objects.create_user(username=username, password=password)
    return Response({'message': 'User registered successfully'})

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(username=username, password=password)

    if user is not None:
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': user.id,
                'username': user.username,
            }
        })
    else:
        return Response({'error': 'Invalid credentials'}, status=400)

# ✅ Generate PDF (Background Task using Celery)
@api_view(['POST'])
@permission_classes([AllowAny])  # Change to [IsAuthenticated] if user login is required
def generate_pdf(request):
    user = request.user if request.user.is_authenticated else None
    link = request.data.get("link")

    if not link:
        return Response({"error": "No YouTube link provided"}, status=400)
    
    # Start Celery task
    task = generate_pdf_task.delay(link, user.id if user else None)
    
    return Response({"message": "PDF generation started", "task_id": task.id})


# ✅ Progress API to Track Task Statuss
@api_view(['GET'])
@permission_classes([AllowAny])
def task_progress(request, task_id):
    task_result = AsyncResult(task_id)
    response_data = {"state": task_result.state}

    if task_result.state == "PROGRESS":
        response_data["current"] = task_result.info.get("current", 0)
        response_data["total"] = task_result.info.get("total", 100)
    elif task_result.state == "SUCCESS":
        response_data.update({
            "class_notes": task_result.result.get("class_notes"),
            "keywords": task_result.result.get("keywords")
        })

    return Response(response_data)



# ✅ Get User PDFs
@api_view(['GET'])
@permission_classes([IsAuthenticated]) 
def get_user_pdfs(request):
    user = request.user
    pdfs = GeneratedPDF.objects.filter(user=user).values("id", "youtube_link", "pdf_file", "created_at")

    for pdf in pdfs:
        pdf["pdf_url"] = request.build_absolute_uri(settings.MEDIA_URL + pdf["pdf_file"])

    return Response({"pdfs": list(pdfs)})
