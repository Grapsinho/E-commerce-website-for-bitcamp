from .models import Consumer, Vendor
from django.contrib.auth.forms import UserCreationForm

class UsersForm(UserCreationForm):
    class Meta:
        model = Consumer
        fields = ['email', 'password1', 'password2']

class VendorForm(UserCreationForm):
    class Meta:
        model = Vendor
        fields = ['email', 'password1', 'password2', 'shop_name']