from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .models import GeneratedPDF
from .main import *
from .pdf import *

# User Authentication Views
@api_view(['POST'])
def register_view(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=400)

    user = User.objects.create_user(username=username, password=password)
    return Response({'message': 'User registered successfully'})

@api_view(['POST'])
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

@api_view(['POST'])
def generate_pdf(request):
    user = request.user
    link = request.data.get("link")  # ✅ Use request.data
    if not link:
        return Response({"error": "No YouTube link provided"}, status=400)
    
    # get the notes
    class_notes, keywords, title, sum_notes = yt2var(link)
    # Make the notes into a pdf
    pdf_name = toPdf(class_notes, keywords, link, user)
    
    pdf_instance = GeneratedPDF.objects.create(
        user=user,
        youtube_link=link,
        pdf_file=f"generated_pdfs/{pdf_name}"    
    )

    return Response({'message': "PDF generated successfully",
        'title': title, 
        'class_notes': class_notes, 
        'keywords': keywords,
        "pdf_url": f"{request.build_absolute_uri(pdf_instance.pdf_file.url)}"})

@api_view(['GET'])
def get_user_pdfs(request):
    user = request.user
    pdfs = GeneratedPDF.objects.filter(user=user).values("id", "youtube_link", "pdf_file", "created_at")

    for pdf in pdfs:
        pdf["pdf_url"] = request.build_absolute_uri(settings.MEDIA_URL + pdf["pdf_file"])

    return Response({"pdfs": list(pdfs)})
