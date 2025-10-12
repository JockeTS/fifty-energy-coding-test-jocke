from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.db import models

# class User(models.Model):
#     id = models.AutoField(primary_key=True)
#     email = models.EmailField(unique=True)
#     username = models.CharField(max_length=150, unique=True)
#     password = models.CharField(max_length=128) # for hashed passwords

class User(AbstractUser):
    pass

class Sensor(models.Model):
    id = models.AutoField(primary_key=True)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sensors')
    name = models.CharField(max_length=150)
    description = models.TextField(null=True, blank=True)
    model = models.CharField(max_length=150)

    # Sensor names should be unique for users but not globally
    class Meta:
        unique_together = ("owner", "name")

class Reading(models.Model):
    id = models.AutoField(primary_key=True)
    sensor = models.ForeignKey(Sensor, on_delete=models.CASCADE, related_name='readings')
    temperature = models.DecimalField(max_digits=5, decimal_places=2)
    humidity = models.DecimalField(max_digits=5, decimal_places=2)
    timestamp = models.DateTimeField()

    class Meta:
        # Create indexes on sensor and timestamp fields
        indexes = [
            models.Index(fields=["sensor", "timestamp"])
        ]
        # Sensor - timestamp pairs must be unique
        unique_together = ("sensor", "timestamp")
        # constraints = [
        #     models.UniqueConstraint(fields=["sensor", "timestamp"], name="unique_sensor_timestamp")
        # ]