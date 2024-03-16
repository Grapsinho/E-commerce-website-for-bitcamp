from django.shortcuts import render
from users.models import Vendor, Consumer
from inventory.models import Product, ProductInventory, ProductAttribute, ProductAttributeValue, Category,Sub_Category, ProductAttributeValues
from django.contrib.auth.decorators import login_required
import jwt
from django.conf import settings
import json
from django.http import JsonResponse
import os
from django.core.files.base import ContentFile
import base64

# ესეიგი დღეს დავჯდები და სერჩს და ფილტრაციას გავაკეთებ
# ეს ორი რო მორჩება ნუ სერჩი გვაქ ფილტრაცია არის და მაგის მერე უეჭველად გადავდივარ პროდუქტ დეტაილზე
#პროდუქტ დეტაილი რო მორჩება მერე ვიზავ პროდუქტის კარტში დამატებას და ამის მერე ვიზავ დეშბოარდ ფეიჯს


"""
    POST /api/users: User registration
    POST /api/vendors: Vendor registration
    GET /api/products: List products
    POST /api/cart: Add item to cart
    PUT /api/cart: Update cart
    DELETE /api/cart: Remove item from cart
    POST /api/checkout: Handle payment and checkout
"""

def home(request):
    try:
        vendor = Vendor.objects.get(email=request.user)
        if request.method == 'GET':
            # Retrieve all ProductInventory instances
            product_inventories = ProductInventory.objects.all()
            attr_dict = {}
            categories = Category.objects.all()

            # Loop through each ProductInventory instance
            for product_inventory in product_inventories:
                # Retrieve all associated attribute values for this ProductInventory instance
                attribute_values = product_inventory.productattributevaluess.all().distinct()
                
                # Loop through each attribute value and print its name and value
                for attribute_value in attribute_values:
                    # Check if the attribute name already exists in the reorganized data
                    if attribute_value.attributevalues.attribute.name in attr_dict:
                        if attribute_value.attributevalues.value not in attr_dict[attribute_value.attributevalues.attribute.name]:
                            # If it's not in the list, append it
                            attr_dict[attribute_value.attributevalues.attribute.name].append(attribute_value.attributevalues.value)
                    else:
                        # If it doesn't exist, create a new list with the value
                        attr_dict[attribute_value.attributevalues.attribute.name] = [attribute_value.attributevalues.value]

        context = {'vendor': vendor, 'attrs': attr_dict.items(), 'product_inventories':product_inventories, 'categories': categories}

        return render(request, 'mainApp/home.html', context)
    except Exception as e:
        print(e, 'error')
        return render(request, 'mainApp/home.html')

def add_products(request):
    vendor = Vendor.objects.get(email=request.user)

    category = Category.objects.all()
    sub_category = Sub_Category.objects.all()

    categoryArr = []
    subCategoryArr = []

    for i in category:
        categoryArr.append(i.name)
    
    for k in sub_category:
        subCategoryArr.append(k.name)

    context = {'vendor': vendor, "category": categoryArr, "subCategory": subCategoryArr}

    return render(request, 'mainApp/add_product.html', context)

def product_detail(request, sku):
    print(sku)
    return render(request, 'mainApp/product_detail.html')

import traceback
@login_required
def ajax_viewFor_CreteProducts(request):
    if request.method == 'POST':
        # Access the JWT token from the Authorization header
        auth_header = request.headers.get('Authorization')
        
        if auth_header and auth_header.startswith('Bearer '):
            jwt_token = auth_header.split(' ')[1]
            
            try:
                # Decode the JWT token using the secret key
                decoded_data = jwt.decode(jwt_token, settings.SECRET_KEY, algorithms=['HS256'])
                
                # Access user information from the decoded token
                user_id = decoded_data.get('user_id')
                user = Vendor.objects.get(pk=user_id)

                # arr1 = ['rame1', 'rame2']

                # for i in arr1:
                #     attr = ProductAttribute.objects.get_or_create(name=i)

                # Access the product_obj and sub_prod_obj as JSON strings
                product_obj_str = request.POST.get('product_obj')
                sub_prod_obj_str = request.POST.get('sub_prod_obj')

                lent = 1
                
                if request.POST.get('lent'):
                    lent = request.POST.get('lent')
                else:
                    lent = 1

                # Parse the JSON strings into Python objects
                product_data = json.loads(product_obj_str)
                sub_product_data = json.loads(sub_prod_obj_str)


                if lent == 1:
                    request.FILES.get('image').name = sub_product_data['product_id_1']['product_sku'] + request.FILES.get('image').name

                    category = Category.objects.get_or_create(name=product_data['category'])
                    sub_category = Sub_Category.objects.get_or_create(name=product_data['product_sub_category'], parent=category[0])
                    product = Product.objects.get_or_create(name=product_data["product_name"], vendor=user, description=product_data["product_desc"], category=sub_category[0], unique_id=sub_product_data['product_id_1']['product_sku']+product_data["product_name"])
                    sub_product = ProductInventory.objects.get_or_create(
                        sku=sub_product_data['product_id_1']['product_sku'],
                        retail_price=int(sub_product_data['product_id_1']['product_price']),
                        is_default=True,
                        img_url=request.FILES.get('image'),
                        product=product[0]
                    )

                    arr1 = []

                    for i in sub_product_data['product_id_1'].keys():
                        if i.startswith('attr'):
                            arr1.append(i.split(sep='_')[1])
                    
                    for v in arr1:
                        attr = ProductAttribute.objects.get_or_create(name=v)
                        attr_value = ProductAttributeValue.objects.get_or_create(
                            attribute=attr[0], 
                            value=sub_product_data['product_id_1'][f"attr_{v}"]
                        )

                        trgh_attr_value = ProductAttributeValues.objects.get_or_create(
                            attributevalues=attr_value[0], 
                            productinventory=sub_product[0]
                        )

                    reorganized_data = {}

                    for i in sub_product[0].productattributevaluess.all():
                        attribute_name = i.attributevalues.attribute.name
                        attribute_value = i.attributevalues.value
                        
                        # Check if the attribute name already exists in the reorganized data
                        if attribute_name in reorganized_data:
                            # If it exists, append the value to the existing list
                            reorganized_data[attribute_name].append(attribute_value)
                        else:
                            # If it doesn't exist, create a new list with the value
                            reorganized_data[attribute_name] = [attribute_value]

                    if sub_product[1]:
                        sub_product[0].save()
                elif int(lent) > 1:
                    category = Category.objects.get_or_create(name=product_data['category'])
                    sub_category = Sub_Category.objects.get_or_create(name=product_data['product_sub_category'], parent=category[0])
                    product = Product.objects.get_or_create(name=product_data["product_name"], vendor=user, description=product_data["product_desc"], category=sub_category[0], unique_id=sub_category[0].name+product_data["product_name"])

                    if product[1]:
                        product[0].save()

                    for i_for_product_id in range(int(lent)):
                        for j in sub_product_data.keys():
                            if int(j.split(sep="_")[2]) == i_for_product_id:
                                request.FILES.get('image').name = sub_product_data[f'product_id_{i_for_product_id}']['product_sku'] + request.FILES.get('image').name

                                sub_product = ProductInventory.objects.get_or_create(
                                    sku=sub_product_data[f'product_id_{i_for_product_id}']['product_sku'],
                                    retail_price=int(sub_product_data[f'product_id_{i_for_product_id}']['product_price']),
                                    is_default=sub_product_data[f'product_id_{i_for_product_id}']['form_check_input'],
                                    img_url=request.FILES.get('image'),
                                    product=product[0]
                                )

                                arr1 = []

                                for i in sub_product_data[f'product_id_{i_for_product_id}'].keys():
                                    if i.startswith('attr'):
                                        arr1.append(i.split(sep='_')[1])
                                
                                for v in arr1:
                                    attr = ProductAttribute.objects.get_or_create(name=v)
                                    attr_value = ProductAttributeValue.objects.get_or_create(
                                        attribute=attr[0], 
                                        value=sub_product_data[f'product_id_{i_for_product_id}'][f"attr_{v}"]
                                    )

                                    #'product_id_attr_Size'

                                    trgh_attr_value = ProductAttributeValues.objects.get_or_create(
                                        attributevalues=attr_value[0], 
                                        productinventory=sub_product[0]
                                    )

                                if sub_product[1]:
                                    sub_product[0].save()

                if int(lent) == 1:
                    # For demonstration purposes, let's just return a simple response
                    response_data = {'product': {
                        "product_name": sub_product[0].product.name,
                        "price": sub_product[0].retail_price,
                        "sku": sub_product[0].sku,
                        "img_url": sub_product[0].img_url.url,
                        "is_default": True,
                        "rec_data": json.dumps(reorganized_data)
                    },
                        "message": "Product Created Successfully"
                    }
                elif int(lent) > 1:
                    response_data = {'product': {
                        "product_name": sub_product[0].product.name,
                        "price": sub_product[0].retail_price,
                        "sku": sub_product[0].sku,
                        "img_url": sub_product[0].img_url.url,
                        "is_default": sub_product[0].is_default,
                    },
                        "message": "Product Created Successfully"
                    }

                return JsonResponse(response_data)
            
            except jwt.ExpiredSignatureError:
                return JsonResponse({'error': 'Token has expired'}, status=401)
            except jwt.InvalidTokenError:
                return JsonResponse({'error': 'Invalid token'}, status=401)
            except Exception as e:
                traceback_str = traceback.format_exc()
                return JsonResponse({'error': f'An error occurred: {str(e)},\n Traceback: {traceback_str}'}, status=500)