from django.urls import path
from . import views

urlpatterns = [
    path('products/', views.ProductInventoryList.as_view(), name='product_inventory_list'),
]