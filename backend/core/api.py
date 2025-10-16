from ninja import NinjaAPI
from core.models import Sensor, Reading
from core.schemas import SensorSchema, SensorOverviewSchema, SensorDetailSchema, SensorCreateSchema, SensorUpdateSchema, ReadingSchema, ReadingCreateSchema
from django.core.paginator import Paginator
from django.shortcuts import get_object_or_404
from django.db import IntegrityError
from ninja.errors import HttpError
from django.utils.dateparse import parse_datetime
from django.http import HttpResponseBadRequest
from ninja.security import HttpBearer
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
from ninja.responses import Response

api = NinjaAPI()

User = get_user_model()

# Try to authenticate user
class JWTAuth(HttpBearer):
    def authenticate(self, request, token):
        try:
            access_token = AccessToken(token)
            user_id = access_token["user_id"]
            user = get_object_or_404(User, id=user_id)
            return user
        except Exception as e:
            return None

@api.get("/hello/", auth=JWTAuth())
def hello(request):
    return {"message": "Hello from Django Ninja!", "user: ": str(request.auth)}

# SENSOR 

# GET - get all sensors (filter by query)
@api.get("/sensors/", auth=JWTAuth(), response=list[SensorOverviewSchema])
def get_sensors(request):
    user = request.auth
    sensors = Sensor.objects.filter(owner=user).order_by("id")
    # sensors = Sensor.objects.filter(owner_id=1)

    # Search query
    q = str(request.GET.get("q", ""))

    if q:
        sensors = sensors.filter(name__icontains=q) | sensors.filter(model__icontains=q)

    # Pagination
    page = int(request.GET.get("page", 1))
    page_size = int(request.GET.get("page_size", 10))

    paginator = Paginator(sensors, page_size)
    page_obj = paginator.get_page(page)

    # return sensors
    return page_obj.object_list

# GET - get a single sensor
@api.get("/sensors/{sensor_id}/", auth=JWTAuth(), response=SensorDetailSchema)
def get_sensor_details(request, sensor_id: int):
    user = request.auth
    sensor = get_object_or_404(Sensor, id=sensor_id, owner=user)
    # sensor = get_object_or_404(Sensor, id=sensor_id, owner_id=1)
    return sensor

# POST - create a new sensor
@api.post("/sensors/", auth=JWTAuth(), response=SensorSchema)
def create_sensor(request, data: SensorCreateSchema):
    user = request.auth
    # owner = get_object_or_404(User, id=1)

    try:
        sensor = Sensor.objects.create(
            owner=user,
            name=data.name,
            model=data.model,
            description=data.description
        )
    except IntegrityError:
        raise HttpError(400, f"A sensor with the name '{data.name}' already exists.")

    return sensor

# PUT - update a sensor
@api.put("/sensors/{sensor_id}/", auth=JWTAuth(), response=SensorSchema)
def update_sensor(request, sensor_id: int, data: SensorUpdateSchema):
    user = request.auth

    # Get sensor object to be updated
    # sensor = get_object_or_404(Sensor, id=sensor_id, owner_id=1)
    sensor = get_object_or_404(Sensor, id=sensor_id, owner=user)

    # Update fields if included in data
    if data.name != None:
        sensor.name = data.name
    if data.model != None:
        sensor.model = data.model
    if data.description != None:
        sensor.description = data.description

    # Save changes to db
    try:
        sensor.save()
    except IntegrityError:
        raise HttpError(400, f"A sensor with the name '{data.name}' already exists.")

    # Display changes
    return sensor

# DELETE - delete a sensor and its associated readings
@api.delete("/sensors/{sensor_id}/", auth=JWTAuth())
def delete_sensor(request, sensor_id: int):
    user = request.auth

    sensor = get_object_or_404(Sensor, id=sensor_id, owner=user)

    sensor.delete()

    # return {"success": True, "message": f"Sensor {sensor_id} deleted."}
    return Response(None, status=204)

# READING

# GET - get all readings for a sensor (filter by from:timestamp - to:timestamp)
@api.get("/sensors/{sensor_id}/readings/", auth=JWTAuth(), response=list[ReadingSchema])
def get_sensors(request, sensor_id: int):
    user = request.auth

    # Sensor to get readings for
    sensor = get_object_or_404(Sensor, id=sensor_id, owner=user)

    timestamp_from = str(request.GET.get("timestamp_from", ""))
    timestamp_to = str(request.GET.get("timestamp_to", ""))

    readings = Reading.objects.filter(sensor=sensor)

    # Filter using timestamps if valid format
    try:
        if timestamp_from:
            readings = readings.filter(timestamp__gte=parse_datetime(timestamp_from))
        if timestamp_to:
            readings = readings.filter(timestamp__lte=parse_datetime(timestamp_to))
    except ValueError:
        return HttpResponseBadRequest("Invalid timestamp_from format. Use YYYY-MM-DD or ISO 8601.")

    # return readings
    return readings

# POST - create a new reading
@api.post("/sensors/{sensor_id}/readings/", auth=JWTAuth(), response=ReadingSchema)
def create_sensor(request, sensor_id: int, data: ReadingCreateSchema):
    user = request.auth

    sensor = get_object_or_404(Sensor, id=sensor_id, owner=user)

    try:
        reading = Reading.objects.create(
            sensor=sensor,
            temperature=data.temperature,
            humidity=data.humidity,
            timestamp=data.timestamp
        )
    except IntegrityError:
        raise HttpError(400, f"A reading with sensor '{sensor_id}' and timestamp '{data.timestamp}' already exists.")

    return reading
