from django.forms import ModelForm 
from inventory.models import ProductInventory

class ProductInventoryImg_url(ModelForm):
    class Meta:
        model = ProductInventory
        fields = ['img_url']