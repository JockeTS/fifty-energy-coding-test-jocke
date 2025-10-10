from ninja import NinjaAPI
from core.models import User, Sensor
from core.schemas import SensorSchema, SensorOverviewSchema, SensorDetailSchema, SensorCreateSchema, SensorUpdateSchema
from django.shortcuts import get_object_or_404
from django.db import IntegrityError
from ninja.errors import HttpError

api = NinjaAPI()

@api.get("/hello/")
def hello(request):
    # sensors = Sensor.objects.all()
    # for sensor in sensors:
    #     print("hej", flush=True)
    #     print(sensor.name, sensor.model, flush=True)
    
    return {"message": "Hello from Django Ninja!"}

# Get all sensors (for logged in user)
@api.get("/sensors/", response=list[SensorOverviewSchema])
def sensors(request):
    # sensors = Sensor.objects.all()

    sensors = Sensor.objects.filter(owner_id=1)

    return sensors

# Get sensor with sensor_id and its associated readings (if owned by logged in user)
@api.get("/sensors/{sensor_id}", response=SensorDetailSchema)
def sensor_details(request, sensor_id: int):
    sensor = get_object_or_404(Sensor, id=sensor_id, owner_id=1)
    return sensor

# Create a new sensor (belonging to logged in user)
@api.post("/sensors/", response=SensorSchema)
def create_sensor(request, data: SensorCreateSchema):
    owner = get_object_or_404(User, id=1)

    try:
        sensor = Sensor.objects.create(
            owner=owner,
            name=data.name,
            model=data.model,
            description=data.description
        )
    except IntegrityError:
        raise HttpError(400, f"A sensor with the name '{data.name} already exists.")

    return sensor

# Update a sensor
@api.put("/sensors/{sensor_id}/", response=SensorSchema)
def update_sensor(request, sensor_id: int, data: SensorUpdateSchema):
    # Get sensor object to be updated
    sensor = get_object_or_404(Sensor, id=sensor_id, owner_id=1)

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
        raise HttpError(400, f"A sensor with the name '{data.name} already exists.")

    # Display changes
    return sensor

# Delete a sensor and its readings
@api.delete("/sensors/{sensor_id}/")
def delete_sensor(request, sensor_id: int):
    sensor = get_object_or_404(Sensor, id=sensor_id, owner_id=1)

    sensor.delete()

    return {"success": True, "message": f"Sensor {sensor_id} deleted."}