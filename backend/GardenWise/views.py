
# GardenWise/views.py

from rest_framework import generics
from .models import Account
from .serializers import AccountSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.views import APIView
from rest_framework.response import Response

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

# Custom token serializer to include username
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        return token

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

