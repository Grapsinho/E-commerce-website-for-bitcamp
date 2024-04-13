from inventory.models import *
from users.models import *
from itertools import chain
from django.db.models import Count
from collections import Counter

def get_recommendations(user):
    # Fetch user's interactions
    user_wishlist = WishlistItem.objects.filter(wishlist__user=user).values_list('product_id', flat=True)
    user_cart_items = CartItem.objects.filter(cart__user=user).values_list('product_id', flat=True)
    user_reviews = Review.objects.filter(user=user).values_list('product_id', flat=True)

    # Combine user's interactions
    all_interactions = list(chain(user_reviews, user_wishlist, user_cart_items))

    # Count occurrences of products in interactions
    product_counter = Counter(all_interactions)

    # Fetch most popular products
    popular_product_ids = [product_id for product_id, _ in product_counter.most_common(10)]
    recommended_product_inventories = ProductInventory.objects.filter(product__id__in=popular_product_ids)

    return recommended_product_inventories
