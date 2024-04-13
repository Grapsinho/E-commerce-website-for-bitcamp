from django.urls import path, include
from .views import *

urlpatterns = [
    path("", home, name="home"),
    path("add_products/", add_products, name="add_products"),
    path("product_detail/<str:sku>/", product_detail, name="product_detail"),
    path("update_product/<str:sku>/", update_product, name="update_product"),

    path('cart/', cart, name='cart'),
    path('add_to_cart/', add_to_cart, name='add_to_cart'),
    path('add_to_cart_users/', add_to_cart_users, name='add_to_cart_users'),
    path('get_cart_data/', get_cart_data, name='get_cart_data'),
    path('remove_product_from_cart/', remove_product_from_cart, name='remove_product_from_cart'),
    path('updateCart/', updateCart, name='updateCart'),
    path('update_cart_guest/', update_cart_guest, name='update_cart_guest'),

    path('cart/checkout_page/', checkout_page, name='checkout_page'),
    path('processOrder/', processOrder, name='processOrder'),
    
    path('deleteProduct/', deleteProduct, name='deleteProduct'),
    path('delete_to_wishlist/', delete_to_wishlist, name='delete_to_wishlist'),
    path("add_to_wishlist/", add_to_wishlist, name="add_to_wishlist"),
    path('update_product_ajax/', update_product_ajax, name='update_product_ajax'),
    path('delete_default_product/', delete_default_product, name='delete_default_product'),
    path("ajax_viewFor_CreteProducts/", ajax_viewFor_CreteProducts, name="ajax_viewFor_CreteProducts"),
    path("filter_products_for_collections/", filter_products_for_collections, name="filter_products_for_collections"),
    path("filter_sub_products_forproduct_detail/", filter_sub_products_forproduct_detail, name="filter_sub_products_forproduct_detail"),
    path("submit_review/", submit_review, name="submit_review"),
    path("delete_review/", delete_review, name="delete_review"),
]