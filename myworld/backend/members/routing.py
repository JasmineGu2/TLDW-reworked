from django.urls import re_path
from .consumers import ProgressConsumer

websocket_urlpatterns = [
    re_path(r'ws/progress/(?P<task_id>\w+)/$', ProgressConsumer.as_asgi()),  # ✅ Change `user_id` to `task_id`
]
