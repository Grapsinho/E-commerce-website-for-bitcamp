from django.contrib import admin
from .models import *

class SubCategoryInline(admin.TabularInline):  # or use admin.StackedInline
    model = Sub_Category
    extra = 1  # Number of empty forms to display

class CategoryAdmin(admin.ModelAdmin):
    inlines = [SubCategoryInline]

admin.site.register(Category, CategoryAdmin)
admin.site.register(Sub_Category)
admin.site.register(Product)
admin.site.register(ProductInventory)
admin.site.register(ProductAttribute)
admin.site.register(ProductAttributeValue)
admin.site.register(OrderItem)
admin.site.register(Order)
admin.site.register(ShippingAddress)
admin.site.register(ProductAttributeValues)