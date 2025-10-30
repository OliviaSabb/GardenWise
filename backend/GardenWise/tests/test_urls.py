from django.urls import reverse, resolve
from GardenWise.views import RegisterView, MyTokenObtainPairView

def test_register_url_resolves():
    url = reverse('register')
    assert resolve(url).func.view_class == RegisterView

def test_token_url_resolves():
    url = reverse('token_obtain_pair')
    assert resolve(url).func.view_class == MyTokenObtainPairView
