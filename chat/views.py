from django.shortcuts import render, redirect
from .models import Chat

def all_chat_view(request):
    # Retrieve chat messages between the current user and the vendor
    current_user = request.user
    all_chats = Chat.objects.filter(sender=current_user) | Chat.objects.filter(receiver=current_user)

    # Pass the chat messages to the template
    context = {
        'all_chats': all_chats
    }
    return render(request, 'chat/all_chat.html', context)

def chat_view(request, pk):
    # Retrieve chat messages between the current user and the vendor
    current_user = request.user
    vendor_chats = Chat.objects.get(pk=pk)
 
    messages = vendor_chats.messages.all()

    if current_user == vendor_chats.receiver:
        vendor_chats.receiver_seen = True
        vendor_chats.save()
    else:
        vendor_chats.sender_seen = True
        vendor_chats.save()

    # Pass the chat messages to the template
    context = {
        'vendor_chats': vendor_chats,
        'messages': messages,
        'curr': current_user
    }
    return render(request, 'chat/chat.html', context)

