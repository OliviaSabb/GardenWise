
# GardenWise/views.py

from rest_framework import generics, status
from .models import Account
from .models import PlantType
from .serializers import AccountSerializer, PlantTypeSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
import requests

# Handles user registration, authentication (JWT tokens), and provides a simple home API endpoint for GardenWise

# Displays a welcome message and available API endpoints
class HomeView(APIView):
    def get(self, request):
        return Response({
            "message": "Welcome to the GardenWise API!",
            "endpoints": {
                "register": "/api/register/",
                "token": "/api/token/",
                # you can add plant endpoints later
            }
        })

# Registration endpoint
class RegisterView(generics.CreateAPIView):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer

# Customizes JWT tokens to include the username field
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        return token

# Handles login requests and issues JWT access and refresh tokens
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class PlantTypePropogation(APIView):
    def get(self, request, format=None):
        plants = PlantType.objects.all()
        serializer = PlantTypeSerializer(plants, many=True)
        return Response(serializer.data)

    def post(self, request):
        api_data = requests.get("https://trefle.io/api/v1/plants/?token=usr-gpChDFS-5C18WHWSjBaxy3sXmq2mJ85tnevytrJBva0&filter[common_name]=garden%20strawberry,cabbage,garlic,Broadleaf wild leek, beet, India Mustard, shallot, garden parsley, wild parsnip, pea, spinach, carrot, celery, Belgium Endive, chives, endive, fennel, garden cress, potato, garden lettuce, bean, aubergine, mung bean, melon, okra, goober, red capsicum, yellow squash pepper, great pumpkin, bittle bottle gourd, afghan-melon, maize, cucumber, cowpea, sweetpotato, tomato, asparagus, horse-radish, garden rhubarb").json()
        api_data2 = requests.get("https://trefle.io/api/v1/plants/?token=usr-gpChDFS-5C18WHWSjBaxy3sXmq2mJ85tnevytrJBva0&filter[common_name]=garden%20strawberry,cabbage,garlic,Broadleaf wild leek, beet, India Mustard, shallot, garden parsley, wild parsnip, pea, spinach, carrot, celery, Belgium Endive, chives, endive, fennel, garden cress, potato, garden lettuce, bean, aubergine, mung bean, melon, okra, goober, red capsicum, yellow squash pepper, great pumpkin, bittle bottle gourd, afghan-melon, maize, cucumber, cowpea, sweetpotato, tomato, asparagus, horse-radish, garden rhubarb&page=2").json()
        
        final_data = api_data['data'] + api_data2['data']

        serializer = PlantTypeSerializer(data = final_data, many=True)
        if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)