from django.urls import path, include
from .views import *

urlpatterns = [
    path("", home, name="home"),
    path("add_products/", add_products, name="add_products"),
    path("product_detail/<str:sku>/", product_detail, name="product_detail"),

    path("ajax_viewFor_CreteProducts/", ajax_viewFor_CreteProducts, name="ajax_viewFor_CreteProducts"),
    path("filter_products_for_collections/", filter_products_for_collections, name="filter_products_for_collections"),
]