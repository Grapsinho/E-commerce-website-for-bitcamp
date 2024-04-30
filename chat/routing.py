from django.urls import path, re_path
from .consumers import ChatConsumer

websocket_urlpatterns = [
    re_path(r'wss/chat/(?P<chat_pk>\d+)/$', ChatConsumer.as_asgi()),
]
