from django.db import models

# This is where we'll define data models, Create your models here.
# GardenWise/models.py
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
from datetime import date, datetime
# Defines a custom user model (structure of stored user data) and manager for handling account creation, authentication, and admin access
# Custom user manager
class AccountManager(BaseUserManager):
    def create_user(self, username, email=None, password=None, zipcode=None):
        if not username:
            raise ValueError("Username is required")
        if not email:
            raise ValueError("Email is required")
        
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, zipcode=zipcode)
        user.set_password(password)  # hashes password
        user.is_active = True
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email=None, password=None, zipcode=None): #create django admin account
        user = self.create_user(username=username, email=email, password=password, zipcode=zipcode)
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user

# Custom user model
class Account(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=32, unique=True)
    email = models.EmailField(unique=True)
    zipcode = models.CharField(max_length=10, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = AccountManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email'] 

    def __str__(self):
        return self.username

# We can change thse variables later if need be
class PlantType(models.Model):
    common_name = models.CharField()
    scientific_name = models.CharField(default = "NULL")
    growth_rate = models.CharField(default = "NULL")
    ph = models.CharField(default = "NULL")
    temperture = models.CharField(default = "NULL")
    season = models.CharField(default = "NULL")
    zone = models.CharField(default = "NULL")
    spacing = models.CharField(default = "NULL")# In Fahrenheit
    category = models.CharField(max_length=50, default="vegetable");

    def __str__(self):
        return self.common_name

class Garden(models.Model):
    user = models.ForeignKey(Account, on_delete=models.CASCADE) # ties the garden to a specific user account. If the user is deleted, their garden will be as well.
    name = models.CharField(max_length=255, default="My Garden")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [ # only unique garden names per user
            models.UniqueConstraint(
                fields=['user', 'name'],
                name='unique_garden_name_per_user'
            )
        ]

    def __str__(self):
        return f"{self.name} - {self.user.username}"
    
# Main Idea is to save plant variables seperately, then combine them into one garden at runtime based on what account they are tied to.   


class GardenPlant(models.Model):
    garden = models.ForeignKey(Garden, on_delete=models.CASCADE)
    plant_type = models.ForeignKey(PlantType, on_delete=models.CASCADE)
    position = models.CharField(max_length=255)
    time_planted = models.DateTimeField(default=timezone.now)
    time_watered = models.DateTimeField(default=timezone.now)
    health = models.CharField(max_length=100, blank=True, default="Healthy")
    notes = models.TextField(blank=True)
    user = models.ForeignKey(Account, on_delete=models.CASCADE)


    def __str__(self):
        return f"{self.plant_type.common_name} in {self.garden.name} at {self.position}"
