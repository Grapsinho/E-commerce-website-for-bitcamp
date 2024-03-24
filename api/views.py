from rest_framework import generics
from inventory.models import ProductInventory
from .serializers import ProductInventorySerializer
import bleach

def sanitize_input(user_input):
    cleaned_input = bleach.clean(user_input, tags=['p', 'strong', 'em'], attributes={'*': ['class']})
    return cleaned_input

class ProductInventoryList(generics.ListAPIView):
    serializer_class = ProductInventorySerializer

    def get_queryset(self):
        q = self.request.query_params.get('search', '')
        if q:
            return ProductInventory.objects.filter(product__name__icontains=sanitize_input(q))
        else:
            return ProductInventory.objects.all()