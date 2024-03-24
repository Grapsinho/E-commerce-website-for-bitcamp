from rest_framework import serializers
from inventory.models import ProductInventory, ProductAttributeValue

class ProductInventorySerializer(serializers.ModelSerializer):
    attribute_values = serializers.SerializerMethodField()
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = ProductInventory
        fields = ['id', 'attribute_values', 'retail_price', 'sku', 'img_url', 'is_default', 'stock', 'product_name']

    def get_attribute_values(self, obj):
        return list(obj.productattributevaluess.values('attributevalues__value', 'attributevalues__attribute__name'))