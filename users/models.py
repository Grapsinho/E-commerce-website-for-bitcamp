from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager

from django.utils.translation import gettext_lazy as _

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)

class Consumer(AbstractUser):
    email = models.EmailField(null=True, unique=True)
    is_vendor = models.BooleanField(default=False)
    full_name = models.CharField(max_length=255, default='None')

    # ანუ იუზერნეიმ ფიელდ იქნება ემაილი ეხლა
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()
    
    def save(self, *args, **kwargs):
        self.username = self.email  # Ensure username stays synced with email
        super().save(*args, **kwargs)
    
    class Meta:
        verbose_name_plural = _("Consumers")

    def __str__(self):
        return self.email

class Vendor(Consumer):
    shop_name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    address = models.CharField(max_length=255, default='None')

    class Meta:
        verbose_name_plural = _("Vendors")

    def __str__(self):
        return self.shop_name