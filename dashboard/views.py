from django.shortcuts import render
from users.models import Vendor
from inventory.models import ProductInventory, Order, Product, Wishlist, WishlistItem, SalesRecord
import bleach
from django.db.models import F


'''
DONE search&filter
DONE user registration&login, password change
DONE product creation
DONE product detail page and rating&reviews
DONE wishlist
DONE product delete&update
DONE dashboard
DONE add to cart & remove from cart & update cart
DONE checkout

eseigi viwyeb mushaobas dashboard peijze chveulebrivi iuzerebistvis

exla naxe ro moval am wishlistis saqmes movrchebi mere egreve daviwyeb iuzeris informaciis shecvlas da egaris ubralod 
updates gavaketeb mets arafers ravi sxva iseti araferi arari

'''

"""
    POST /api/users: User registration
    POST /api/vendors: Vendor registration
    GET /api/products: List products
    POST /api/cart: Add item to cart
    PUT /api/cart: Update cart
    DELETE /api/cart: Remove item from cart
    POST /api/checkout: Handle payment and checkout
"""

def sanitize_input(user_input):
    cleaned_input = bleach.clean(user_input, tags=['p', 'strong', 'em'], attributes={'*': ['class']})
    return cleaned_input

def dashboard(request, sku):
    vendor = Vendor.objects.get(email=sku)

    context = {}

    products = ProductInventory.objects.filter(product__vendor=vendor).annotate(avg_rating=F('product__ratings__average_rating')).order_by('-avg_rating')

    # Get distinct product names
    distinct_product_names = []
    top_5_product = []
    for product in products:

        if product.product.name not in distinct_product_names:
            distinct_product_names.append(product.product.name)
            top_5_product.append(product)
            if len(top_5_product) == 6:
                break

    lent = len(top_5_product)

    try:
        for i in range(lent):
            context[f'prod_{i+1}'] = top_5_product[i].product.ratings.average_rating
            context[f'rprod_{i+1}'] = top_5_product[i].product.category.name
    except:
        pass

    context['count_product'] = len(products)
    context['products'] = products
    context['top_5_product'] = top_5_product

    product_sales_records = SalesRecord.objects.filter(vendor=vendor)

    context['product_sales_records'] = product_sales_records

    product_sold_quantity = []

    for i in product_sales_records:
        product_sold_quantity.append(i.quantity_sold) 
    
    context['product_sold_quantity'] = sum(product_sold_quantity)
    
    return render(request, 'dashboard/dashboard.html', context)

def dashboard_consumer(request):
    # Retrieve orders associated with the current user
    orders = Order.objects.filter(costumer=request.user)

    wishlist12 = Wishlist.objects.get(user=request.user)

    wishlist_items = WishlistItem.objects.filter(wishlist=wishlist12)

    len_wish = len(wishlist_items)

    context = {'orders': orders, 'orderLen': len(orders), "wishLen": len_wish, "wishprods": wishlist_items}
    return render(request, 'dashboard/dashboard_consumer.html', context)

def update_vendor(request, email):
    vendor = Vendor.objects.get(email=email)
    return render(request, 'dashboard/update_vendor.html', {'vend': vendor})
