one = {
    "product_id_1":{"product_sku":"asd","product_price":"2134","product_stock":"214","product_image":"C:\\fakepath\\image7.jpg","attr_aasd":"asd"},
    "product_id_2":{"product_sku":"asd","product_price":"2134","product_stock":"214","product_image":"C:\\fakepath\\image7.jpg","attr_aasd":"asd"},


    'rame': {'category': 'asd', 'product_sub_category': 'sad', 'product_name': 'sad', 'product_desc': 'asd'},
    'rame2': {'product_id_1': {'product_sku': '21421421', 'product_price': '21', 'product_stock': '12', 'product_image': 'C:\\fakepath\\image6.jpg', 'attr_Color': 'Red', 'attr_Material': 'Cotton'}}
} 

#print(len(one))
# from inventory.models import ProductAttribute
# arr1 = ['rame1', 'rame2']

# for i in arr1:
#     attr = md.ProductAttribute.objects.get_or_create(name=i)

# print(attr)

# # import os
# # file_path = "C:\\fakepath\\image11.jpg"

# # # Extract the filename using os.path.basename
# # file_name = os.path.basename(file_path)
# print(one['rame2']['product_id_1'].keys())

# for i in one['rame2']['product_id_1'].keys():
#     if i.startswith('attr'):
#         print(i.split(sep='_')[1])

boj1 = {
    'product_id_0': {'product_sku': '32423', 'product_price': '32432', 'product_stock': '234234', 'attr_asd': 'asd', 'attr_asdasd': 'asdas'},
    'product_id_1': {'product_sku': '324234', 'product_price': '234324', 'product_stock': '234234', 'attr_asd': 'asd', 'attr_asdasd': 'asdas'}
}

print(boj1.keys())

for i in boj1.keys():
    print(i.split(sep="_")[2], end=" ")

