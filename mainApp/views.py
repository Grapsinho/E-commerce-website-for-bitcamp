from django.shortcuts import render
from users.models import Vendor, Consumer
from inventory.models import Product, ProductInventory, ProductAttribute, ProductAttributeValue, Category,Sub_Category, ProductAttributeValues, Rating, Review
from django.contrib.auth.decorators import login_required
import jwt
from django.conf import settings
import json
from django.http import JsonResponse
from django.db.models import Avg
import bleach
from django.db.models import F
import os


'''
DONE search&filter
DONE user registration&login, password change
DONE product creation but we have some bugs but im not gonna fix them
DONE product detail page and rating&reviews
DONE product delete

eseigi xval gavaketeb washlas da updates productis
anu washilstvis unda davamato productis unique id da mere rogorc chatgpt aketebs egre vqna

Dashboard, add to cart
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

def home(request):
    try:
        vendor = Vendor.objects.get(email=request.user)
        if request.method == 'GET':
            # Retrieve all ProductInventory instances

            q = request.GET.get('search') if request.GET.get('search') != None else ''

            if q == '':
                product_inventories = ProductInventory.objects.all()
            else:
                product_inventories = ProductInventory.objects.filter(product__name__icontains=sanitize_input(q))

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

        context = {'vendor': vendor, 'attrs': attr_dict.items(), 'product_inventories':product_inventories, 'categories': categories, 'q': q}

        return render(request, 'mainApp/home.html', context)
    except Exception as e:
            if request.method == 'GET':
            # Retrieve all ProductInventory instances

                q = request.GET.get('search') if request.GET.get('search') != None else ''

                if q == '':
                    product_inventories = ProductInventory.objects.all()
                else:
                    product_inventories = ProductInventory.objects.filter(product__name__icontains=sanitize_input(q))

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

            context = {'attrs': attr_dict.items(), 'product_inventories':product_inventories, 'categories': categories, 'q': q}

            return render(request, 'mainApp/home.html', context)

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
    try:
        vendor = Vendor.objects.get(email=request.user)
        product = ProductInventory.objects.filter(product__unique_id=sku)

        produ_name = ''

        for i in product:
            produ_name = i.product.name

        # Prepare filter data for all attributes
        filter_data = {}
        attribute_scores = {}

        for p in product:
            attributes = p.productattributevaluess.values_list('attributevalues__attribute__name', flat=True).distinct()

            for attr in attributes:
                attribute_values = p.productattributevaluess.filter(attributevalues__attribute__name=attr).values_list('attributevalues__value', flat=True)
                filter_data.setdefault(attr, set()).update(attribute_values)
                attribute_scores[attr] = attribute_scores.get(attr, 0) + len(attribute_values)

        # Step 3: Evaluate attribute importance
        most_important_attribute = max(attribute_scores, key=attribute_scores.get)
            
        reorganized_data1 = {}
            
        # Identify the default product
        default_product = product.filter(is_default=True).values('productattributevaluess__attributevalues__attribute__name', "productattributevaluess__attributevalues__value")
            
        for i in default_product:
            attribute_name = i["productattributevaluess__attributevalues__attribute__name"]
            attribute_value = i["productattributevaluess__attributevalues__value"]
            reorganized_data1[attribute_name] = [attribute_value]

        print(filter_data, 'filter_data')
        print(most_important_attribute)

        product32 = product[0].product

        reviews = product32.reviews.all()
        rating_instance, _ = Rating.objects.get_or_create(product=product32)
        average_rating = rating_instance.average_rating
        num_ratings = rating_instance.num_ratings

        context = {
                "vendor": vendor,
                "product": product,
                "filter_data": filter_data,
                "produ_name": produ_name,
                "rec_data1": reorganized_data1,
                'most_important_attribute': most_important_attribute,
                'sku': sku,
                'reviews': reviews, 'average_rating': average_rating, 'num_ratings': num_ratings
            }
        return render(request, 'mainApp/product_detail.html', context)
    except Exception as e:
            product = ProductInventory.objects.filter(product__unique_id=sku)

            produ_name = ''

            for i in product:
                produ_name = i.product.name

            # Prepare filter data for all attributes
            filter_data = {}
            attribute_scores = {}

            for p in product:
                attributes = p.productattributevaluess.values_list('attributevalues__attribute__name', flat=True).distinct()

                for attr in attributes:
                    attribute_values = p.productattributevaluess.filter(attributevalues__attribute__name=attr).values_list('attributevalues__value', flat=True)
                    filter_data.setdefault(attr, set()).update(attribute_values)
                    attribute_scores[attr] = attribute_scores.get(attr, 0) + len(attribute_values)

            # Step 3: Evaluate attribute importance
            most_important_attribute = max(attribute_scores, key=attribute_scores.get)
            
            reorganized_data1 = {}
            
            # Identify the default product
            default_product = product.filter(is_default=True).values('productattributevaluess__attributevalues__attribute__name', "productattributevaluess__attributevalues__value")
            
            for i in default_product:
                attribute_name = i["productattributevaluess__attributevalues__attribute__name"]
                attribute_value = i["productattributevaluess__attributevalues__value"]
                reorganized_data1[attribute_name] = [attribute_value]

            print(filter_data, 'filter_data')
            print(most_important_attribute)

            product32 = product[0].product

            reviews = product32.reviews.all()
            rating_instance, _ = Rating.objects.get_or_create(product=product32)
            average_rating = rating_instance.average_rating
            num_ratings = rating_instance.num_ratings

            context = {
                "product": product,
                "filter_data": filter_data,
                "produ_name": produ_name,
                "rec_data1": reorganized_data1,
                'most_important_attribute': most_important_attribute,
                'sku': sku,
                'reviews': reviews, 'average_rating': average_rating, 'num_ratings': num_ratings
            }
            return render(request, 'mainApp/product_detail.html', context)

def dashboard(request, sku):
    vendor = Vendor.objects.get(email=sku)

    context = {}

    products = ProductInventory.objects.filter(product__vendor=vendor).annotate(avg_rating=F('product__rating__average_rating')).order_by('-avg_rating')

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

    for i in range(lent):
        context[f'prod_{i+1}'] = top_5_product[i].product.rating.average_rating
        context[f'rprod_{i+1}'] = top_5_product[i].product.category.name

    context['count_product'] = len(products)
    context['products'] = products
    context['top_5_product'] = top_5_product
    
    return render(request, 'mainApp/dashboard.html', context)

def filter_sub_products_forproduct_detail(request):
    if request.method == 'GET':
        filters = request.GET.get('filters_data')
        sku_for_prod = request.GET.get('sku_for_prod')
        filter2 = json.loads(filters)

        print(filter2)

        filtered_products = None

        if len(filter2) > 1:
            filtered_products = ProductInventory.objects.filter(product__unique_id=sku_for_prod,productattributevaluess__attributevalues__value=filter2[1])
        else:
            filtered_products = ProductInventory.objects.filter(product__unique_id=sku_for_prod,productattributevaluess__attributevalues__value=filter2[0])
        
        # Implement your filtering logic here based on the filters received
        # Example: filtered_products = Product.objects.filter(**filters)

        most_important_attribute = ''

        if len(filtered_products) == 1:
            l1 = list()
        
            for ii in filtered_products[0].productattributevaluess.all().values('attributevalues__value'):
                l1.append(ii['attributevalues__value'])
            context = {
                'sku': filtered_products[0].sku,
                'img_url': filtered_products[0].img_url.url,
                'price': filtered_products[0].retail_price,
                'desc': filtered_products[0].product.description,
                'name': filtered_products[0].product.name,
                'stock': filtered_products[0].stock,
                'values': l1
            }
        elif len(filtered_products) > 1:  
            l1 = list()

            all_attributes = set()
            for p in filtered_products:
                attributes = p.productattributevaluess.values_list('attributevalues__attribute__name', flat=True)
                all_attributes.update(attributes)

            # Prepare filter data for all attributes
            filter_data = {}
            for attr in all_attributes:
                values = set()
                for p in filtered_products:
                    attribute_values = p.productattributevaluess.filter(attributevalues__attribute__name=attr).values_list('attributevalues__value', flat=True)
                    values.update(attribute_values)
                    l1.append(attribute_values[0])
                filter_data[attr] = values

            # Step 2: Evaluate attribute importance
            attribute_scores = {}
            for attribute, values in filter_data.items():
                print(attribute, values)
                attribute_scores[attribute] = len(values)  # Use the number of unique values as the score

            # Step 3: Select the most important attribute
            most_important_attribute = max(attribute_scores, key=attribute_scores.get)

            print(most_important_attribute, 'rameeee')

            print(attribute_scores, 'rameeee')
            
            if (len(filter2) > 1):
                filtered_products = filtered_products.filter(productattributevaluess__attributevalues__value=filter2[0])

            l13 = list()
        
            for ii in filtered_products[0].productattributevaluess.all().values('attributevalues__value'):
                l13.append(ii['attributevalues__value'])

            context = {
                'sku': filtered_products[0].sku,
                'img_url': filtered_products[0].img_url.url,
                'price': filtered_products[0].retail_price,
                'desc': filtered_products[0].product.description,
                'stock': filtered_products[0].stock,
                'name': filtered_products[0].product.name,
                "most_important_attribute1": most_important_attribute,
                'values': l1,
                'values_for_current_item': l13
            }

        else:
            print('error')

        # Return the filtered products as HTML response
        return JsonResponse(context)
    else:
        # Handle invalid request method
        return JsonResponse({'error': 'Invalid request method'}, status=405)

def filter_products_for_collections(request):
    sort_option = request.GET.get('sort', 'low_to_high')
    filters_cat = request.GET.get('filters_cat')
    filters_attr = request.GET.get('filters_attr')
    search_q = request.GET.get('search_q')

    if filters_cat: 
        filters_cat_dict = json.loads(filters_cat)
    else:
        filters_cat_dict = None

    if filters_attr: 
        filters_attr_dict = json.loads(filters_attr)
    else:
        filters_attr_dict = None

    if search_q:
        products = ProductInventory.objects.filter(product__name__icontains=search_q).order_by('retail_price').distinct()
    else:
        products = ProductInventory.objects.all().order_by('retail_price').distinct()

    if filters_cat_dict: 
        products = products.filter(product__category__name__in=filters_cat_dict)

    if filters_attr_dict: 
        products = products.filter(productattributevaluess__attributevalues__value__in=filters_attr_dict)

    # Apply sorting
    if sort_option == 'low_to_high':
        products = products.order_by('retail_price')
    elif sort_option == 'high_to_low':
        products = products.order_by('-retail_price') 

    serialized_products = [{
            'name': product.product.name,
            'price': product.retail_price,
            'unique_id': product.product.unique_id,
            'img_url': product.img_url.url,
        
        } for product in products.distinct()]


    return JsonResponse({'products': serialized_products})

def submit_review(request):
    if request.method == 'POST':
        rating = int(request.POST.get('rating'))
        comment = request.POST.get('comment')
        user = request.user
        product_id = request.POST.get('product_id')

        product = Product.objects.get(unique_id=product_id)

        # Save the review
        review = Review.objects.create(product=product, user=user, rating=rating, comment=sanitize_input(comment))

        # Calculate average rating
        average_rating = Review.objects.filter(product=product).aggregate(Avg('rating'))['rating__avg']

        # Update or create rating instance for the product
        rating_instance, created = Rating.objects.get_or_create(product=product)
        rating_instance.average_rating = average_rating
        rating_instance.num_ratings = Review.objects.filter(product=product).count()
        rating_instance.save()

        return JsonResponse({
            'user': user.username,
            'rating': rating,
            'comment': comment,
            'average_rating': average_rating,
            'num_ratings': rating_instance.num_ratings
        })
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=400)

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

                # Access the product_obj and sub_prod_obj as JSON strings
                product_obj_str = request.POST.get('product_obj')
                sub_prod_obj_str = request.POST.get('sub_prod_obj')

                lent = 1
                fine1 = False
                fine2 = False
                
                if request.POST.get('lent'):
                    lent = request.POST.get('lent')
                else:
                    lent = 1

                # Parse the JSON strings into Python objects
                product_data = json.loads(product_obj_str)
                sub_product_data = json.loads(sub_prod_obj_str)

                category = None
                sub_category = None
                product = None

                if lent == 1: 
                    print('magariaaa')                                   
                    print(sub_product_data['product_id_1']['product_sku']+f'-{user}')

                    try:
                        check_sku = ProductInventory.objects.get(sku=sub_product_data['product_id_1']['product_sku']+f'-{user}')

                        if check_sku:
                            fine1 = False
                            return JsonResponse({'message12521': f"please choose different SKU, because one of your product already have it '{sub_product_data['product_id_1']['product_sku']}' "})
                    except:
                        category = Category.objects.get_or_create(name=product_data['category'].title())
                        sub_category = Sub_Category.objects.get_or_create(name=product_data['product_sub_category'].title(), parent=category[0])
                        product = Product.objects.get_or_create(name=product_data["product_name"], vendor=user, description=product_data["product_desc"], category=sub_category[0])

                        if product[1]:
                            product[0].unique_id = product[0].slug + f"-{product[0].pk}"
                            product[0].save()
                    
                        fine1 = True
                if int(lent) > 1:
                    try:
                        for i_for_product_id in range(int(lent)):
                            for j in sub_product_data[i_for_product_id].keys():
                                if int(j.split(sep="_")[2]) == i_for_product_id:

                                    print(sub_product_data[i_for_product_id][f'product_id_{i_for_product_id}']['product_sku']+f'-{user}')
                                    check_sku = ProductInventory.objects.get(sku=sub_product_data[i_for_product_id][f'product_id_{i_for_product_id}']['product_sku']+f'-{user}')

                                    if check_sku:
                                        fine2 = False
                                        return JsonResponse({'message12521': f"please choose different SKU, because one of your product already have it '{sub_product_data[i_for_product_id][f'product_id_{i_for_product_id}']['product_sku']}' "})
                    except:
                        category = Category.objects.get_or_create(name=product_data['category'].title())
                        sub_category = Sub_Category.objects.get_or_create(name=product_data['product_sub_category'].title(), parent=category[0])
                        product = Product.objects.get_or_create(name=product_data["product_name"], vendor=user, description=product_data["product_desc"], category=sub_category[0])

                        if product[1]:
                            product[0].unique_id = product[0].slug + f"-{product[0].pk}"
                            product[0].save()

                        fine2 = True

                if lent == 1 and fine1:
                        request.FILES.get('image').name = sub_product_data['product_id_1']['product_sku'] + request.FILES.get('image').name

                        sub_product = ProductInventory.objects.get_or_create(
                            sku=sub_product_data['product_id_1']['product_sku']+f'-{user}',
                            retail_price=int(sub_product_data['product_id_1']['product_price']),
                            is_default=True,
                            img_url=request.FILES.get('image'),
                            stock=int(sub_product_data['product_id_1']['product_stock']),
                            product=product[0]
                        )

                        arr1 = []

                        for i in sub_product_data['product_id_1'].keys():
                            if i.startswith('attr'):
                                arr1.append(i.split(sep='_')[1])
                        
                        for v in arr1:
                            attr = ProductAttribute.objects.get_or_create(name=v.title())
                            attr_value = ProductAttributeValue.objects.get_or_create(
                                attribute=attr[0], 
                                value=sub_product_data['product_id_1'][f"attr_{v}"].title()
                            )

                            trgh_attr_value = ProductAttributeValues.objects.get_or_create(
                                attributevalues=attr_value[0], 
                                productinventory=sub_product[0]
                            )

                        if sub_product[1]:
                            sub_product[0].save()
                elif int(lent) > 1 and fine2:
                    for i_for_product_id in range(int(lent)):
                        for j in sub_product_data[i_for_product_id].keys():
                            if int(j.split(sep="_")[2]) == i_for_product_id:
                                request.FILES.getlist('image')[i_for_product_id].name = sub_product_data[i_for_product_id][f'product_id_{i_for_product_id}']['product_sku'] + request.FILES.getlist('image')[i_for_product_id].name

                                sub_product = ProductInventory.objects.get_or_create(
                                    sku=sub_product_data[i_for_product_id][f'product_id_{i_for_product_id}']['product_sku']+f'-{user}',
                                    retail_price=int(sub_product_data[i_for_product_id][f'product_id_{i_for_product_id}']['product_price']),
                                    is_default=sub_product_data[i_for_product_id][f'product_id_{i_for_product_id}']['form_check_input'],
                                    img_url=request.FILES.getlist('image')[i_for_product_id],
                                    product=product[0],
                                    stock=int(sub_product_data[i_for_product_id][f'product_id_{i_for_product_id}']['product_stock'])
                                )

                                arr1 = []

                                for i in sub_product_data[i_for_product_id][f'product_id_{i_for_product_id}'].keys():
                                    if i.startswith('attr'):
                                        arr1.append(i.split(sep='_')[1])
                                
                                for v in arr1:
                                    if v is not None:
                                        attr = ProductAttribute.objects.get_or_create(name=v.title())
                                        attr_value = ProductAttributeValue.objects.get_or_create(
                                            attribute=attr[0], 
                                            value=sub_product_data[i_for_product_id][f'product_id_{i_for_product_id}'][f"attr_{v}"].title()
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
                       "product_id": product[0].unique_id,
                    },
                        "message": "Product Created Successfully"
                    }
                elif int(lent) > 1:
                    response_data = {'product': {
                        "product_id": product[0].unique_id,
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
            
from datetime import datetime
@login_required
def deleteProduct(request):
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

                # Access expiration time from the decoded token
                expiration_time = decoded_data.get('exp')
                
                # Convert expiration time from Unix timestamp to datetime object
                expiration_datetime = datetime.utcfromtimestamp(expiration_time)
                
                # Calculate remaining time until expiration
                current_datetime = datetime.utcnow()
                remaining_time = expiration_datetime - current_datetime
                
                print("Token expiration time:", expiration_datetime)
                print("Remaining time until expiration:", remaining_time)

                delete_product = request.POST.get('sku')
                default = request.POST.get('default')
                uniqueId = request.POST.get('uniqueId')

                if default == "True":
                    product = Product.objects.get(unique_id=uniqueId)
                    # Find the default sub-product associated with the default product
                    default_sub_product = ProductInventory.objects.filter(product=product, is_default=True).first()
                    if default_sub_product:
                        # Prepare the list of alternative sub-products
                        alternative_sub_products = ProductInventory.objects.filter(product=product, is_default=False)

                        if  len(alternative_sub_products) == 0:
                            # Proceed with deleting the product
                            ProductAttributeValues.objects.filter(productinventory=default_sub_product).delete()
                            
                            # Retrieve the path of the photo associated with the sub-product
                            photo_path = default_sub_product.img_url.url

                            # Delete the photo file from the storage
                            if os.path.exists(f'static{photo_path}'):
                                os.remove(f'static{photo_path}')

                            default_sub_product.delete()
                            
                            return JsonResponse({'success': 'Product deleted successfully'})
                        else:
                            alternative_products = [{"sku": sub_product.sku, "name": sub_product.product.name} for sub_product in alternative_sub_products]
                            return JsonResponse({'warning': 'You are deleting the default product. Please choose the next default product.', 'alternatives': alternative_products, 'delete_product': delete_product})
                    else:
                        return JsonResponse({'error': 'Something went wrong, try again'})
                        
                else:
                    product = Product.objects.get(unique_id=uniqueId)
                    # Proceed with deleting the product
                    delete_sub_product = ProductInventory.objects.get(product=product, sku=delete_product)

                    ProductAttributeValues.objects.filter(productinventory=delete_sub_product).delete()
                    
                    # Retrieve the path of the photo associated with the sub-product
                    photo_path = delete_sub_product.img_url.url

                    # Delete the photo file from the storage
                    if os.path.exists(f'static{photo_path}'):
                        os.remove(f'static{photo_path}')

                    delete_sub_product.delete()
                    
                    return JsonResponse({'success': 'Product deleted successfully'})
            
            except jwt.ExpiredSignatureError:
                return JsonResponse({'error': 'Token has expired'}, status=401)
            except jwt.InvalidTokenError:
                return JsonResponse({'error': 'Invalid token'}, status=401)
            except Exception as e:
                traceback_str = traceback.format_exc()
                return JsonResponse({'error': f'An error occurred: {str(e)},\n Traceback: {traceback_str}'}, status=500)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=400)

def delete_default_product(request):
    if request.method == 'POST':
        new_default = request.POST.get('selectedSku')
        product_for_delete = request.POST.get('product_for_delete')

        new_default_prod = ProductInventory.objects.get(sku=new_default)

        new_default_prod.is_default = True

        new_default_prod.save()

        prod_to_del = ProductInventory.objects.get(sku=product_for_delete)

        ProductAttributeValues.objects.filter(productinventory=prod_to_del).delete()
                    
        # Retrieve the path of the photo associated with the sub-product
        photo_path = prod_to_del.img_url.url

        # Delete the photo file from the storage
        if os.path.exists(f'static{photo_path}'):
            os.remove(f'static{photo_path}')

        prod_to_del.delete()

        return JsonResponse({'success': 'Product deleted successfully'})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=400)
