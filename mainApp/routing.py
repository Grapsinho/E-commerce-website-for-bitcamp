from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'wss/live_search/$', consumers.LiveSearchConsumer.as_asgi()),
]
