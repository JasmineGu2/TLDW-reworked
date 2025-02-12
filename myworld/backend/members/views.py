import threading
from django.http import JsonResponse
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.conf import settings
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.pagination import PageNumberPagination

from .models import GeneratedNotes
from .pdf import * 
from .main import yt2var  # Import yt2var
from django.core.cache import cache

from django.shortcuts import get_object_or_404
from .models import Concept, GeneratedNotes
from .serializers import ConceptSerializer, GeneratedNotesSerializer

# Fetch concepts
@api_view(['GET'])
@permission_classes([AllowAny]) 
def get_concepts(request):
    concepts = Concept.objects.all()
    serializer = ConceptSerializer(concepts, many=True)
    return Response({"concepts": serializer.data})

@api_view(['POST'])
@permission_classes([AllowAny]) 
def add_concept(request):
    name = request.data.get("name")

    if not name:
        return Response({"error": "Concept name cannot be empty"}, status=400)

    # Check if concept already exists
    if Concept.objects.filter(name__iexact=name).exists():  
        return Response({"error": "Concept already exists"}, status=400)

    # Create concept if not
    concept = Concept.objects.create(name=name)
    return Response({"message": "Concept added", "concept": ConceptSerializer(concept).data})

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

@api_view(["POST"])
@permission_classes([AllowAny])  
def generate_pdf(request):
    user = request.user if request.user.is_authenticated else User.objects.filter(is_superuser=True).first()
    link = request.data.get("link")
    file_name = request.data.get("file_name")
    concept_name = request.data.get("concept_name")

    if not link:
        return Response({"error": "No YouTube link provided"}, status=400)

    #  Use user Id for taskId
    task_id = f"user_{user.id if user else 'anonymous'}"

    # Run yt2var in a separate thread 
    thread = threading.Thread(target=yt2var, args=(link, task_id, file_name, user, concept_name))
    thread.start()

    # Return task_id immediately so frontend can start listening to WebSocket updates
    print("task" + task_id)
    return JsonResponse({"message": "PDF generation started", "task_id": task_id})

from rest_framework.pagination import PageNumberPagination

@api_view(['GET'])
@permission_classes([AllowAny])  
def get_notes(request):
    """
    Fetches all notes (PDFs) with pagination,  search, and multi-concept filtering.
    """

    # Extract query parameters
    page = request.query_params.get("page", 1)
    page_size = request.query_params.get("page_size", 10)  
    search_query = request.query_params.get("search", "").strip()

    concepts = request.query_params.getlist("concept")  # List of concept names

    # Base query
    notes_query = GeneratedNotes.objects.all()

    # Filter by multiple concepts (if provided)
    if concepts:
        matched_concepts = Concept.objects.filter(name__in=concepts)
        print(matched_concepts)
        if matched_concepts.exists():
            notes_query = notes_query.filter(concept__in=matched_concepts)
            print(notes_query)
    print("Existing Notes:", list(GeneratedNotes.objects.values_list("concept__name", "pdf_file")))

    # Search by title (case insensitive)
    if search_query:
        notes_query = notes_query.filter(title__icontains=search_query)
    
    paginator = PageNumberPagination()
    paginator.page_size = page_size  
    paginated_notes = paginator.paginate_queryset(notes_query, request)

    # Format response
    notes_list = []
    for note in paginated_notes:
        notes_list.append({
            "id": note.id,
            "youtube_link": note.youtube_link,
            "pdf_file": note.pdf_file.url if note.pdf_file else None,
            "pdf_url": request.build_absolute_uri(note.pdf_file.url) if note.pdf_file else None,
            "class_notes": note.class_notes,
            "keywords": note.keywords,
            "title": note.title,
            "created_at": note.created_at.strftime("%Y-%m-%d %H:%M"),
            "concept": note.concept.name if note.concept else "Uncategorized",
        })

    # Return paginated response
    return paginator.get_paginated_response(notes_list)


@api_view(["GET"])
@permission_classes([AllowAny])  
def get_task_result(request, task_id):
    """Fetch stored task result"""
    result = cache.get(task_id)
    if result:
        return Response(result, status=200)
    return Response({"error": "Result not available yet"}, status=404)