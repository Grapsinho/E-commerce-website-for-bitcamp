# Generated by Django 5.0.2 on 2024-03-10 17:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('inventory', '0006_alter_productinventory_img_url'),
    ]

    operations = [
        migrations.AlterField(
            model_name='productinventory',
            name='img_url',
            field=models.ImageField(blank=True, default='No image.svg', null=True, upload_to='static/images/'),
        ),
    ]
