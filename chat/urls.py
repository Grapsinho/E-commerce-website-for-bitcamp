from django.urls import path, include
from .views import *

urlpatterns = [
    path("chat/<int:pk>/", chat_view, name="chat_view"),
    path("all_chat/", all_chat_view, name="all_chat_view"),
]