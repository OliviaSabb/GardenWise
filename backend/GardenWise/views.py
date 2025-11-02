
# GardenWise/views.py
from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken  # Import RefreshToken
from rest_framework.exceptions import NotFound
import requests
from rest_framework.permissions import AllowAny
from .models import Account, PlantType, Garden, GardenPlant
from .serializers import AccountSerializer, PlantTypeSerializer, GardenSerializer, GardenPlantSerializer
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
    permission_classes = [AllowAny]

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
    
class GardenListCreateView(generics.ListCreateAPIView):
    serializer_class = GardenSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Garden.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class GardenRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = GardenSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Garden.objects.filter(user=user)

class GardenPlantListCreateView(generics.ListCreateAPIView):
    serializer_class = GardenPlantSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        garden_id = self.kwargs['garden_id']
        return GardenPlant.objects.filter(garden__id=garden_id, garden__user=self.request.user)

    def perform_create(self, serializer):
        # Use garden_id from URL, not garden_pk
        garden = Garden.objects.get(pk=self.kwargs['garden_id'])
        serializer.save(user=self.request.user, garden=garden)

class GardenPlantRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = GardenPlantSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        garden_id = self.kwargs['garden_id']
        return GardenPlant.objects.filter(garden__user=user, garden_id=garden_id)

# Logout View
class LogoutView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        try:
            refresh_token = request.data["refresh"] #Changed from refresh_token to refresh
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)