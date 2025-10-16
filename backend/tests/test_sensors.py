import pytest
import json
from django.contrib.auth import get_user_model
from django.test import Client
from core.api import api
from core.models import Sensor

User = get_user_model()

# Test creating a new sensor
@pytest.mark.django_db
def test_create_sensor():
    client = Client()

    # Create user + token
    user = User.objects.create_user(username="testuser", password="password123")
    login_res = client.post(
        "/api/auth/token/",
        {"username": user.username, "password": "password123"}
    )
    token = login_res.json()["access"]

    payload = {
        "name": "Test Sensor",
        "model": "TS-1000",
        "description": "A test sensor"
    }

    response = client.post(
        "/api/sensors/",
        data=json.dumps(payload),
        content_type="application/json",
        HTTP_AUTHORIZATION=f"Bearer {token}"
    )

    print("test data:", response.json())
    assert response.status_code == 200 or response.status_code == 201
    assert Sensor.objects.filter(name="Test Sensor", owner=user).exists()

# Test updating an existing sensor
@pytest.mark.django_db
def test_update_sensor():
    # Create user and sensor
    user = User.objects.create_user(username="testuser2", password="password123")
    sensor = Sensor.objects.create(owner=user, name="Old Name", model="TS-500")

    # Authenticate and get JWT token
    client = Client()
    login_response = client.post(
        "/api/auth/token/",
        {"username": user.username, "password": "password123"},
    )
    assert login_response.status_code == 200, login_response.content
    token = login_response.json()["access"]

    # Prepare update payload
    payload = {
        "name": "Updated Sensor Name",
        "model": "X2",
        "description": "Updated description",
    }

    # Send PUT request as JSON
    response = client.put(
        f"/api/sensors/{sensor.id}/",
        data=json.dumps(payload),
        content_type="application/json",
        HTTP_AUTHORIZATION=f"Bearer {token}",  # Django test client expects header keys prefixed with HTTP_
    )

    print("UPDATE response:", response.status_code, response.content)

    # Check status code
    assert response.status_code in (200, 201)

    # Verify updated data in DB
    sensor.refresh_from_db()
    assert sensor.name == "Updated Sensor Name"
    assert sensor.model == "X2"
    assert sensor.description == "Updated description"

# Test deleting an existing sensor
@pytest.mark.django_db
def test_delete_sensor():
    # Create a user and a sensor
    user = User.objects.create_user(username="testuser3", password="password123")
    sensor = Sensor.objects.create(owner=user, name="To Delete", model="TS-500")

    client = Client()

    # Log in to get JWT access token
    login_response = client.post(
        "/api/auth/token/",
        {"username": user.username, "password": "password123"},
    )
    assert login_response.status_code == 200, login_response.content
    token = login_response.json()["access"]

    # Perform DELETE request with JWT
    response = client.delete(
        f"/api/sensors/{sensor.id}/",
        HTTP_AUTHORIZATION=f"Bearer {token}",  # correct header prefix
    )

    print("DELETE response:", response.status_code, response.content)

    # Validate the response and database state
    assert response.status_code == 204
    assert not Sensor.objects.filter(id=sensor.id).exists()

# test that list of sensors is correctly split into pages
@pytest.mark.django_db
def test_get_sensors_paginated():
    user = User.objects.create_user(username="testuser", password="password123")
    # create 25 sensors for this user
    for i in range(25):
        Sensor.objects.create(owner=user, name=f"Sensor {i}", model="X")

    client = Client()
    token = client.post("/api/auth/token/", {"username": user.username, "password": "password123"}).json()["access"]

    response = client.get("/api/sensors/?page=2&page_size=10", HTTP_AUTHORIZATION=f"Bearer {token}")
    data = response.json()

    assert response.status_code == 200
    assert len(data) == 10  # second page, 10 items
    assert data[0]["name"] == "Sensor 10"  # items should start from the 11th sensor
