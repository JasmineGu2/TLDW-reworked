import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ProgressConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.task_id = self.scope["url_route"]["kwargs"]["task_id"]  # ✅ Change `user_id` to `task_id`
        self.task_group_name = f"progress_{self.task_id}"  # ✅ Use task_id, not user_id

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
