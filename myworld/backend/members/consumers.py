import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ProgressConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user_id = self.scope["url_route"]["kwargs"]["user_id"]
        self.task_group_name = f"user_{self.user_id}"

        # ✅ Join WebSocket group
        await self.channel_layer.group_add(
            self.task_group_name,
            self.channel_name,
        )
        await self.accept()

    async def disconnect(self, close_code):
        # ✅ Leave WebSocket group
        await self.channel_layer.group_discard(
            self.task_group_name,
            self.channel_name,
        )

    async def send_progress(self, event):
        # ✅ Send progress updates to the frontend
        await self.send(text_data=json.dumps(event))
