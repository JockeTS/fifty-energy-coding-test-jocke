from django.test import Client
from django.contrib.auth import get_user_model
import pytest

User = get_user_model()

# Test registering a user
@pytest.mark.django_db
def test_register_user():
    client = Client() # Django test client

    payload = {
        "username": "newuser",
        "password": "strongpassword123",
        "email": "newuser@example.com",
    }

    response = client.post("/api/auth/register/", data=payload)
    assert response.status_code == 201
    assert User.objects.filter(username="newuser").exists()

# Test logging a user in
@pytest.mark.django_db
def test_login_user():
    client = Client()
    # First, create a user
    user = User.objects.create_user(username="existing", password="password123")

    payload = {
        "username": "existing",
        "password": "password123"
    }

    response = client.post("/api/auth/token/", payload)
    assert response.status_code == 200
    data = response.json()
    # Check that an access token is returned
    assert "access" in data
    assert "refresh" in data
