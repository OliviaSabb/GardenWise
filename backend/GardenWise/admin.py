from django.contrib import admin
from .models import Garden, PlantType, Account, GardenPlant

# Register your models here.
admin.site.register(PlantType)
admin.site.register(Account)
admin.site.register(GardenPlant)
admin.site.register(Garden)