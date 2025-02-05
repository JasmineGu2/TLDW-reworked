from django.http import JsonResponse
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.conf import settings
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .pdf import * 
from .main import yt2var  # Import yt2var

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

@api_view(["POST"])
@permission_classes([AllowAny])  # Change to [IsAuthenticated] if login is required
def generate_pdf(request):
    user = request.user 
    link = request.data.get("link")

    if not link:
        return Response({"error": "No YouTube link provided"}, status=400)

    # ✅ Process Video & Get Results (WebSocket updates happen inside `yt2var`)
    result = yt2var(link, user)

    return Response(
        {
            "message": "PDF generated successfully",
            "class_notes": result["class_notes"],
            "keywords": result["keywords"],
            "pdf_url": request.build_absolute_uri(result["pdf_url"]),
        }
    )


# ✅ Get User PDFs
@api_view(['GET'])
@permission_classes([IsAuthenticated]) 
def get_user_pdfs(request):
    user = request.user
    pdfs = GeneratedPDF.objects.filter(user=user).values("id", "youtube_link", "pdf_file", "created_at")

    for pdf in pdfs:
        pdf["pdf_url"] = request.build_absolute_uri(settings.MEDIA_URL + pdf["pdf_file"])

    return Response({"pdfs": list(pdfs)})
