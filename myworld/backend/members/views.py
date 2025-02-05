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

from .models import GeneratedPDF
from .pdf import * 
from .main import yt2var  # Import yt2var
from django.core.cache import cache

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

from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from .main import yt2var  # ✅ Import yt2var (handles everything)

# @api_view(["POST"])
# @permission_classes([AllowAny])  # Change to [IsAuthenticated] if login is required
# def generate_pdf(request):
#     user = request.user 
#     link = request.data.get("link")

#     if not link:
#         return Response({"error": "No YouTube link provided"}, status=400)

#     # ✅ Process Video & Get Results (WebSocket updates happen inside `yt2var`)
#     result = yt2var(link, user)

#     return Response(
#         {
#             "message": "PDF generated successfully",
#             "class_notes": result["class_notes"],
#             "keywords": result["keywords"],
#             "pdf_url": request.build_absolute_uri(result["pdf_url"]),
#         }
#     )


@api_view(["POST"])
@permission_classes([AllowAny])  # Change to [IsAuthenticated] if login is required
def generate_pdf(request):
    user = request.user if request.user.is_authenticated else None
    link = request.data.get("link")

    if not link:
        return Response({"error": "No YouTube link provided"}, status=400)

    # ✅ Use user Id for taskId
    task_id = f"user_{user.id if user else 'anonymous'}"

    # ✅ Run yt2var in a separate thread (Non-blocking)
    thread = threading.Thread(target=yt2var, args=(link, task_id))
    thread.start()

    # ✅ Return task_id immediately so frontend can start listening to WebSocket updates
    return JsonResponse({"message": "PDF generation started", "task_id": task_id})

# ✅ Get User PDFs
@api_view(['GET'])
@permission_classes([AllowAny]) 
def get_user_pdfs(request):
    user = request.user
    pdfs = GeneratedPDF.objects.filter(user=user).values("id", "youtube_link", "pdf_file", "created_at")

    for pdf in pdfs:
        pdf["pdf_url"] = request.build_absolute_uri(settings.MEDIA_URL + pdf["pdf_file"])

    return Response({"pdfs": list(pdfs)})

@api_view(["GET"])
@permission_classes([AllowAny])  
def get_task_result(request, task_id):
    """Fetch stored task result"""
    result = cache.get(task_id)
    if result:
        return Response(result, status=200)
    return Response({"error": "Result not available yet"}, status=404)