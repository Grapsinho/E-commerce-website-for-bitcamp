from django.urls import path, include
from .views import *

urlpatterns = [
    path("", home, name="home"),
    path("add_products/", add_products, name="add_products"),
    path("product_detail/<str:sku>/", product_detail, name="product_detail"),
    path("dashboard/<str:sku>/", dashboard, name="dashboard"),
    path("update_product/<str:sku>/", update_product, name="update_product"),
    
    path('deleteProduct/', deleteProduct, name='deleteProduct'),
    path('update_product_ajax/', update_product_ajax, name='update_product_ajax'),
    path('delete_default_product/', delete_default_product, name='delete_default_product'),
    path("ajax_viewFor_CreteProducts/", ajax_viewFor_CreteProducts, name="ajax_viewFor_CreteProducts"),
    path("filter_products_for_collections/", filter_products_for_collections, name="filter_products_for_collections"),
    path("filter_sub_products_forproduct_detail/", filter_sub_products_forproduct_detail, name="filter_sub_products_forproduct_detail"),
    path("submit_review/", submit_review, name="submit_review"),
]