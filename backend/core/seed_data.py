from core.models import User, Sensor, Reading
from django.utils import timezone

def run():
    # Delete child models first
    Reading.objects.all().delete()
    Sensor.objects.all().delete()
    User.objects.all().delete()

    # Create user(s) and sensors
    user1 = User.objects.create(email="jocke@fifty.se", username="jocke", password="test123")

    Sensor.objects.create(owner=user1, name="device-001", model="EnviroSense")
    Sensor.objects.create(owner=user1, name="device-002", model="ClimaTrack")
    Sensor.objects.create(owner=user1, name="device-003", model="AeroMonitor")
    Sensor.objects.create(owner=user1, name="device-004", model="HydroTherm")
    Sensor.objects.create(owner=user1, name="device-005", model="EcoStat")

    # u1 = User.objects.create(email="peo@fifty.se", username="Peo", password="blank")

    # s1 = Sensor.objects.create(owner=u1, name="device-001", model="T-1000")
    # s2 = Sensor.objects.create(owner=u1, name="device-002", model="T-2000")

    # Reading.objects.create(sensor=s1, temperature=22.3, humidity=44.2, timestamp=timezone.now())
    # Reading.objects.create(sensor=s2, temperature=25.0, humidity=50.1, timestamp=timezone.now())

run()