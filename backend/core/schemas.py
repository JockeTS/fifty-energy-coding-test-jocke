from ninja import Schema
from typing import List, Optional
from datetime import datetime

# READING
class ReadingSchema(Schema):
    id: int
    sensor_id: int
    temperature: float
    humidity: float
    timestamp: datetime

class ReadingCreateSchema(Schema):
    temperature: float
    humidity: float
    timestamp: datetime

# SENSOR
class SensorSchema(Schema):
    id: int
    name: str
    description: Optional[str] = None
    model: str
    owner_id: int

class SensorOverviewSchema(Schema):
    id: int
    name: str
    description: Optional[str] = None
    model: str

class SensorDetailSchema(Schema):
    id: int
    name: str
    description: Optional[str] = None
    model: str
    # readings: List[ReadingSchema] = []

class SensorCreateSchema(Schema):
    name: str
    model: str
    description: Optional[str] = None

class SensorUpdateSchema(Schema):
    name: Optional[str] = None
    model: Optional[str] = None
    description: Optional[str] = None