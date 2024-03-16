from django.urls import path, include
from .views import *
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

urlpatterns = [

    # views that handles registration and authorization
    path("signup/", SignUpView.as_view(), name="signup"),
    path("signup_vendors/", SignUpView_vendor.as_view(), name="signup_vendors"),
    path("signin/", LoginView.as_view(), name="signin"),

    # just template views
    path('registration/', registration, name='registration'),
    path('vendor_registration/', vendor_registration, name='vendor_registration'),
    path('login/', loginView, name='login'),
    path('logout/', logoutForm, name='logout'),

    # ამით ვქმნით ტოკენს
    path("jwt/create/", TokenObtainPairView.as_view(), name="jwt-create"),
    # ამით ვარეფრეშებთ ანუ ახალ ტოკენს ვიღებთ
    path("jwt/refresh/", TokenRefreshView.as_view(), name="jwt-refresh"),
    # ამით ვტესტავთ კარგია თუ არა ეს ახალი ტოკენი
    path("jwt/verify/", TokenVerifyView.as_view(), name="jwt-verify"),
]