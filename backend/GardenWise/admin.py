from django.contrib import admin
from .models import Garden, PlantType, Account, GardenPlant

# Register your models here.
# admin.site.register(PlantType)
# admin.site.register(Account)
# admin.site.register(GardenPlant)
# admin.site.register(Garden)

# --- PlantType admin ---
@admin.register(PlantType)
class PlantTypeAdmin(admin.ModelAdmin):
    list_display = ('id', 'common_name', 'category', 'season', 'zone')
    # search filter
    search_fields = ('common_name', 'scientific_name')

# --- GardenPlant admin ---
@admin.register(GardenPlant)
class GardenPlantAdmin(admin.ModelAdmin):
    list_display = ('id', 'plant_type', 'garden', 'position', 'time_planted', 'user')
    list_filter = ('garden', 'plant_type')
    search_fields = ('position',)


# --- Garden admin ---
@admin.register(Garden)
class GardenAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'user', 'created_at')
    list_filter = ('user',)
    search_fields = ('name',)


# Account
@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ('id', 'username', 'email')