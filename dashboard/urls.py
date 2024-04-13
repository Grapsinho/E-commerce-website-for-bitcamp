from django.urls import path, include
from .views import *

urlpatterns = [
    path("dashboard/<str:sku>/", dashboard, name="dashboard"),
    path("dashboard_consumer/", dashboard_consumer, name="dashboard_consumer"),
    path("dashboard/<str:email>/update_vendor/", update_vendor, name="update_vendor"),
]