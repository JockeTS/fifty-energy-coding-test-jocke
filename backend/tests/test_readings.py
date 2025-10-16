import pytest
import json
from django.contrib.auth import get_user_model
from django.test import Client
from core.models import Sensor, Reading
from datetime import datetime, timedelta
from django.utils import timezone
from django.utils.dateparse import parse_datetime

User = get_user_model()

# Test getting unfiltered readings, readings filtered by timestamp_from, readings filtered by timestamp_to, and readings filtered by both timestamp_from and timestamp_to
@pytest.mark.django_db
def test_get_readings_with_filters():
    client = Client()

    # Create user + get JWT token
    user = User.objects.create_user(username="testuser", password="password123")
    login_res = client.post(
        "/api/auth/token/",
        {"username": user.username, "password": "password123"},
    )
    token = login_res.json()["access"]

    # Create sensor
    sensor = Sensor.objects.create(owner=user, name="Test Sensor", model="TS-1000")

    # Create readings at known timestamps
    # base_time = datetime(2024, 8, 1, 0, 0)
    base_time = timezone.make_aware(datetime(2024, 8, 1, 0, 0))

    readings = [
        Reading.objects.create(
            sensor=sensor,
            temperature=20 + i,
            humidity=50 + i,
            timestamp=base_time + timedelta(hours=i)
        )
        for i in range(5)
    ]

    # No filter -> all readings
    res = client.get(f"/api/sensors/{sensor.id}/readings/", content_type="text/html", HTTP_AUTHORIZATION=f"Bearer {token}")
    assert res.status_code == 200
    all_data = res.json()
    print("All readings:", all_data)
    assert len(all_data) == 5

    ts_from_dt = base_time + timedelta(hours=2)

    # Send ISO string with timezone info
    ts_from_str = ts_from_dt.isoformat()

    res = client.get(
        f"/api/sensors/{sensor.id}/readings/?timestamp_from={ts_from_str[:16]}",
        HTTP_AUTHORIZATION=f"Bearer {token}"  # Django test client uses HTTP_ prefix
    )

    data = res.json()

    # Convert each reading timestamp to aware datetime before comparison
    assert len(data) == 3
    assert all(parse_datetime(r["timestamp"]) >= ts_from_dt for r in data)

    # timestamp_to -> readings up to 2:00
    ts_to = (base_time + timedelta(hours=2)).isoformat()
    res = client.get(f"/api/sensors/{sensor.id}/readings/?timestamp_to={ts_to[:16]}", content_type="text/html", HTTP_AUTHORIZATION=f"Bearer {token}")
    data = res.json()
    assert len(data) == 3
    assert all(datetime.fromisoformat(r["timestamp"]) <= datetime.fromisoformat(ts_to) for r in data)

    # timestamp_from & timestamp_to -> readings between 1:00 and 2:00
    ts_from = (base_time + timedelta(hours=1)).isoformat()
    ts_to = (base_time + timedelta(hours=2)).isoformat()
    res = client.get(
        f"/api/sensors/{sensor.id}/readings/?timestamp_from={ts_from[:16]}&timestamp_to={ts_to[:16]}",
        content_type="text/html", HTTP_AUTHORIZATION=f"Bearer {token}"
    )
    data = res.json()
    assert len(data) == 2
    assert data[0]["timestamp"][:16] == readings[1].timestamp.isoformat()[:16]
    assert data[1]["timestamp"][:16] == readings[2].timestamp.isoformat()[:16]

# Test creating a reading
@pytest.mark.django_db
def test_create_sensor_reading():
    client = Client()

    # Create user + get JWT token
    user = User.objects.create_user(username="testuser", password="password123")
    login_res = client.post(
        "/api/auth/token/",
        {"username": user.username, "password": "password123"},
    )
    token = login_res.json()["access"]

    # Create sensor
    sensor = Sensor.objects.create(owner=user, name="Test Sensor", model="TS-1000")

    url = f"/api/sensors/{sensor.id}/readings/"
    data = {
        "temperature": 25.5,
        "humidity": 45.2,
        "timestamp": "2025-10-16T08:00",
    }

    response = client.post(
        url,
        data,
        content_type="application/json",
        HTTP_AUTHORIZATION=f"Bearer {token}",
    )

    assert response.status_code == 200, response.content
    result = response.json()
    assert result["sensor_id"] == sensor.id
    assert abs(result["temperature"] - data["temperature"]) < 0.001
    assert abs(result["humidity"] - data["humidity"]) < 0.001
    assert result["timestamp"].startswith("2025-10-16T08:00")

    # Verify it was actually created in DB
    reading = Reading.objects.get(sensor=sensor, timestamp=data["timestamp"])