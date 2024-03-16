# Generated by Django 5.0.2 on 2024-03-01 20:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_alter_consumer_managers_alter_vendor_managers'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='consumer',
            options={'verbose_name_plural': 'Consumers'},
        ),
        migrations.AlterModelOptions(
            name='vendor',
            options={'verbose_name_plural': 'Vendors'},
        ),
        migrations.AddField(
            model_name='consumer',
            name='is_vendor',
            field=models.BooleanField(default=False),
        ),
    ]
