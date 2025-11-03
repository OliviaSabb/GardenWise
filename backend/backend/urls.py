"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
# Routes: admin panel, home, user registration, and JWT login endpoints

# gardenwise_project/urls.py
from django.contrib import admin
from django.urls import path
from GardenWise.views import (
    HomeView, RegisterView,
    MyTokenObtainPairView, LogoutView,
    GardenListCreateView, GardenRetrieveUpdateDestroyView,
    GardenPlantListCreateView, GardenPlantRetrieveUpdateDestroyView,
    PlantTypePropogation, PlantTypeView
)
from rest_framework_simplejwt.views import TokenBlacklistView
# main router
# router = routers.DefaultRouter()


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', HomeView.as_view(), name='home'),

    # Auth
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', LogoutView.as_view(), name='token_refresh'),
    path('api/token/blacklist/', TokenBlacklistView.as_view(), name='token_blacklist'),

    # Gardens
    path('api/gardens/', GardenListCreateView.as_view(), name='garden_list'),
    path('api/gardens/<int:pk>/', GardenRetrieveUpdateDestroyView.as_view(), name='garden_detail'),

    # Plants within gardens
    path('api/gardens/<int:garden_id>/plants/', GardenPlantListCreateView.as_view(), name='garden_plants'),
    path('api/gardens/<int:garden_id>/plants/<int:pk>/', GardenPlantRetrieveUpdateDestroyView.as_view(), name='garden_plant_detail'),

    # Plant info
    path('api/planttype/propogate', PlantTypePropogation.as_view(), name='plantType_Propogation'),
    path('api/planttype/plants', PlantTypeView.as_view(), name='plantType')

]
