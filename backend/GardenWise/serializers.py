# GardenWise/serializers.py
from rest_framework import serializers
from .models import Account, PlantType, Garden, GardenPlant

from django.contrib.auth.hashers import make_password

from django.utils import timezone
from datetime import datetime, date, time

# this file is the middle layer between the database and the API, ensuring data is validated, secure, and correctly formatted.
class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def validate_username(self, value):
        if not value:
            raise serializers.ValidationError("Username cannot be empty")
        return value
    
    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("Email cannot be empty")
        if Account.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email is already in use")
        return value

    def validate_password(self, value):
        if not value:
            raise serializers.ValidationError("Password cannot be empty")
        return value

    def create(self, validated_data):
        # Hash password before saving
        validated_data['password'] = make_password(validated_data['password'])
        account = Account.objects.create(**validated_data)

        # Automatically create a default garden for each new account
        Garden.objects.create(name="Default Garden", user=account)

        return account

    
class PlantTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlantType
        fields = '__all__'

class GardenPlantSerializer(serializers.ModelSerializer):
    type_id = serializers.IntegerField(source='plant_type.id', read_only=True)
    type_name = serializers.CharField(source='plant_type.common_name', read_only=True)

    class Meta:
        model = GardenPlant
        fields = '__all__'
        read_only_fields = ['user', 'garden']

class GardenSerializer(serializers.ModelSerializer):
    garden_plants = GardenPlantSerializer(many=True, read_only=True) # Nest GardenPlantSerializer
    class Meta:
        model = Garden
        fields = '__all__'
        read_only_fields = ['user', 'garden']