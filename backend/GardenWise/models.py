from django.db import models

# This is where we'll define data models, Create your models here.
# GardenWise/models.py
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

# Defines a custom user model (structure of stored user data) and manager for handling account creation, authentication, and admin access
# Custom user manager
class AccountManager(BaseUserManager):
    def create_user(self, username, email=None, password=None):
        if not username:
            raise ValueError("Username is required")
        if not email:
            raise ValueError("Email is required")
        
        email = self.normalize_email(email)
        user = self.model(username=username, email=email)
        user.set_password(password)  # hashes password
        user.is_active = True
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email=None, password=None): #create django admin account
        user = self.create_user(username=username, email=email, password=password)
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user

# Custom user model
class Account(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=32, unique=True)
    email = models.EmailField(unique=True)
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
    ph = models.FloatField(default = 0.0)
    temperture = models.CharField(default = "NULL")
    season = models.CharField(default = "NULL")
    zone = models.CharField(default = "NULL")
    spacing = models.CharField(default = "NULL")
    


    def __str__(self):
        return self.common_name


# Main Idea is to save plant variables seperately, then combine them into one garden at runtime based on what account they are tied to.   
class GardenPlant(models.Model):
    type = PlantType()
    user = Account()
    position = models.CharField() # Represent position with letters for column and numbers for row? (like in chess; A4, B2, etc)
    time_planted = models.DateTimeField()
    time_watered = models.DateTimeField()
    health = models.CharField()

