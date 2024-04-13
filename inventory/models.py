from django.db import models
from django.utils.text import slugify

#მოკლედ ეს დაგვჭირდა იმიტომ რომ მინიმალური ფასის რაოდენობა მიგვეთითებინა
from decimal import Decimal
from django.core.validators import MinValueValidator, MaxValueValidator

#ეს არის ტექსტის თარგმნისთვის
from django.utils.translation import gettext_lazy as _

from phonenumber_field.modelfields import PhoneNumberField

from users.models import Consumer, Vendor

from django.utils import timezone

class Category(models.Model):
    name = models.CharField(
        max_length=100,
    )
    slug = models.SlugField(max_length=150, unique=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = _("categories")

    def save(self, *args, **kwargs):
        self.slug = slugify(self.name)
        super(Category, self).save(*args, **kwargs)

    def __str__(self):
        return self.name

class Sub_Category(models.Model):
    parent = models.ForeignKey(Category, on_delete=models.CASCADE)
    name = models.CharField(
        max_length=100,
    )
    slug = models.SlugField(max_length=150, unique=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = _("sub_categories")

    def save(self, *args, **kwargs):
        self.slug = slugify(self.name)
        super(Sub_Category, self).save(*args, **kwargs)

    def __str__(self):
        return self.name

class ProductAttribute(models.Model):
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name

class ProductAttributeValue(models.Model):
    attribute = models.ForeignKey(ProductAttribute, on_delete=models.CASCADE)
    value = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.attribute.name}: {self.value}"

class Product(models.Model):
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE)
    unique_id = models.CharField(max_length=300, default='None')
    slug = models.SlugField(
        max_length=255,
    )
    name = models.CharField(
        max_length=255,
    )
    description = models.TextField(blank=True)
    category = models.ForeignKey(
        Sub_Category,
        related_name="product",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        editable=False,
    )
    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def save(self, *args, **kwargs):
        self.slug = slugify(self.name)
        super(Product, self).save(*args, **kwargs)

    def __str__(self):
        return self.name

class ProductInventory(models.Model):
    sku = models.CharField(
        max_length=120,
    )
    product = models.ForeignKey(Product, related_name="product", on_delete=models.PROTECT)
    productAttributes = models.ManyToManyField(
        ProductAttributeValue,
        related_name="product_attribute_values",
        through="ProductAttributeValues",
    )
    is_default = models.BooleanField(
        default=False,
    )
    img_url = models.ImageField(null=True, blank=True, default='No image.svg')
    #როცა იქნება დისქოუნთი უნდა გამოვაჩინო სთოურ ფრაისი და რითეილ ფრაისი სხვა ფრად ან გადახაზულად ანუ სთოურ ფრაისი არის დისქოუნთი და ის მთავარი ფასი
    retail_price = models.DecimalField(
        max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal("0.01"))]
    )
    store_price = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )
    stock = models.IntegerField(
        default=0,
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        editable=False,
    )
    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        return f"{self.sku} -- {self.pk}"

class Wishlist(models.Model):
    user = models.ForeignKey(Consumer, on_delete=models.CASCADE, related_name='wishlist')
    products = models.ManyToManyField('ProductInventory', through='WishlistItem', related_name='wishlists_new', blank=True)

    def __str__(self):
        return f"Wishlist for {self.user.email}"

class WishlistItem(models.Model):
    wishlist = models.ForeignKey(Wishlist, related_name='wishlistss', on_delete=models.CASCADE)
    product = models.ForeignKey('ProductInventory', related_name='wishlists_newss', on_delete=models.PROTECT)
    added_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.wishlist.user.email}'s Wishlist Item: {self.product.sku}"
    
class Cart(models.Model):
    user = models.OneToOneField(Consumer, related_name='cart', on_delete=models.CASCADE)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Cart for {self.user.username}"

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey('ProductInventory', related_name='cart_items', on_delete=models.CASCADE)
    quantity = models.IntegerField(default=0)

    def __str__(self):
        return f"CartItem: {self.product.sku} ({self.quantity}) in {self.cart}"
    
    @property
    def get_total(self):
        total = self.product.retail_price * self.quantity
        return total
    
    def get_attribute(self):
        # Retrieve the first attribute associated with the product
        attributes = self.product.productAttributes.all()
        if attributes.exists():
            return attributes.first().attribute.name
        return None

    def get_attr_value(self):
        # Retrieve the value of the first attribute associated with the product
        attribute_values = self.product.productAttributes.all()
        if attribute_values.exists():
            return attribute_values.first().value
        return None

class ProductAttributeValues(models.Model):
    attributevalues = models.ForeignKey(
        "ProductAttributeValue",
        related_name="attributevaluess",
        on_delete=models.PROTECT,
    )
    productinventory = models.ForeignKey(
        ProductInventory,
        related_name="productattributevaluess",
        on_delete=models.PROTECT,
    )

    class Meta:
        unique_together = (("attributevalues", "productinventory"),)

class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(Consumer, on_delete=models.CASCADE)
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review for {self.product.name} by {self.user.username}"
    
class Rating(models.Model):
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name='ratings')
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    num_ratings = models.IntegerField(default=0)

    def __str__(self):
        return f"Rating for {self.product.name}"

class Order(models.Model):
    costumer = models.ForeignKey(Consumer, on_delete=models.SET_NULL, null=True, blank=True)
    date_ordered = models.DateTimeField(auto_now_add=True)
    complete = models.BooleanField(default=False, null=True, blank=False) #ეს ცვლის ჩვენი cartის სტატუს ამას მერე თუ გავიგებ კარგად შევცვლი|ჩვენი ორდერი complete არის თუ არა

    #ეს ასერომვთქვათ არის ანუ როდესაც იუზერი შეიძენს რამეს მაგისი უნიკალური იდენთიფიკატორი
    transaction_id = models.CharField(max_length=100, null=True)

    def __str__(self):
        return str(self.id)

    @property
    def get_all_total(self):
        orderItems = self.orderitem_set.all()
        total = sum([item.get_total for item in orderItems])
        return total
    
    @property
    def get_all_items(self):
        orderItems = self.orderitem_set.all()
        total = sum([item.quantity for item in orderItems])
        return total

class SalesRecord(models.Model):
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE)
    product = models.ForeignKey(ProductInventory, on_delete=models.CASCADE)
    quantity_sold = models.PositiveIntegerField(default=0)
    sale_datetime = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.product.product.name} - {self.quantity_sold} units sold on {self.sale_datetime}"

class OrderItem(models.Model):
    product = models.ForeignKey(ProductInventory, on_delete=models.CASCADE, null=True, blank=True)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, null=True, blank=True)
    quantity = models.IntegerField(default=0, null=True, blank=True)
    date_added = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return str(self.product.product.name)

    @property
    def get_total(self):
        total = self.product.retail_price * self.quantity
        return total

class ShippingAddress(models.Model):
    costumer = models.ForeignKey(Consumer, on_delete=models.SET_NULL, null=True, blank=True)
    order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True, blank=True)
    full_name = models.CharField(max_length=100, null=True)
    address = models.CharField(max_length=500, null=True)
    city = models.CharField(max_length=500, null=True)
    Postal_code = models.CharField(max_length=30, null=True)
    phone_number = PhoneNumberField(region="GE")
    email = models.EmailField(null=True)

    def __str__(self):
        return self.address