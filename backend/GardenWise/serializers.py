# GardenWise/serializers.py
from rest_framework import serializers
from .models import Account
from django.contrib.auth.hashers import make_password

# this file is the middle layer between the database and the API, ensuring data is validated, secure, and correctly formatted.
class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ['id', 'username', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def validate_username(self, value):
        if not value:
            raise serializers.ValidationError("Username cannot be empty")
        return value

    def validate_password(self, value):
        if not value:
            raise serializers.ValidationError("Password cannot be empty")
        return value

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        return Account.objects.create(**validated_data)