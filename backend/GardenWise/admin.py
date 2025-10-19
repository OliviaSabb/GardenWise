from django.contrib import admin
from .models import PlantType, Account, GardenPlant

# Register your models here.
admin.site.register(PlantType)
admin.site.register(Account)
admin.site.register(GardenPlant)