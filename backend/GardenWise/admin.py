from django.contrib import admin
from .models import Garden, PlantType, Account, GardenPlant

# Register your models here.
# admin.site.register(PlantType)
# admin.site.register(Account)
# admin.site.register(GardenPlant)
# admin.site.register(Garden)


# updated admin registers so lists are more detailed

# PlantType  
@admin.register(PlantType)
class PlantTypeAdmin(admin.ModelAdmin):
    list_display = ('id', 'common_name', 'category', 'season', 'zone')
    search_fields = ('common_name', 'category', 'season', 'zone')

# GardenPlant  
@admin.register(GardenPlant)
class GardenPlantAdmin(admin.ModelAdmin):
    list_display = ('id', 'plant_type', 'garden', 'position', 'time_planted', 'user')
    list_filter = ('garden', 'plant_type',)
    search_fields = ('position',)

# Garden 
@admin.register(Garden)
class GardenAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'user', 'created_at')
    search_fields = ('name',)

# Account
@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ('id', 'username', 'email')