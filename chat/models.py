from django.db import models
from users.models import Consumer
from django.utils import timezone

# Create your models here.

class Chat(models.Model):
    sender = models.ForeignKey(Consumer, on_delete=models.CASCADE, related_name='sent_chats')
    receiver = models.ForeignKey(Consumer, on_delete=models.CASCADE, related_name='received_chats')
    receiver_seen = models.BooleanField(default=False)
    sender_seen = models.BooleanField(default=False)

    def __str__(self):
        return f'Chat between {self.sender} and {self.receiver}'

class Message(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(Consumer, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField()
    timestamp = models.DateTimeField(default=timezone.now)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f'Message from {self.sender} in {self.chat}'