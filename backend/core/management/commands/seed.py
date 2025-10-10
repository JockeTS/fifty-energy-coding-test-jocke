from django.core.management.base import BaseCommand
from django.core.management import call_command
from core.models import User, Sensor, Reading
import csv
from datetime import datetime

class Command(BaseCommand):
    def handle(self, *args, **options):
        # Flush the database (so id:s start from 1)
        call_command('flush', '--no-input')

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

        # Create readings from csv file
        with open("core/data/sensor_readings_wide.csv", newline="") as csvfile:
            for row in csv.DictReader(csvfile):
                try:
                    sensor = Sensor.objects.get(owner=user1, name=row["device_id"])
                    timestamp = datetime.fromisoformat(row["timestamp"])
                    Reading.objects.create(
                        sensor=sensor,
                        temperature=float(row["temperature"]),
                        humidity=float(row["humidity"]),
                        timestamp=timestamp
                    )
                # Skip if sensor does not exist
                except Sensor.DoesNotExist:
                    self.stdout.write(f"Sensor {row['device_id']} not found, skipping.")

        self.stdout.write("Database successfully seeded.")