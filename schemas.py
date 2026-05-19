from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime

class AddressBase(BaseModel):
    street: str
    city: str
    state: str
    zip_code: str
    country: str
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)

    @validator('street', 'city', 'state', 'zip_code', 'country')
    def not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Field cannot be empty')
        return v.strip()

class AddressCreate(AddressBase):
    pass

class AddressUpdate(BaseModel):
    street: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    country: Optional[str] = None
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)

class AddressResponse(AddressBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

class NearbyQuery(BaseModel):
    lat: float = Field(..., ge=-90, le=90)
    lon: float = Field(..., ge=-180, le=180)
    distance_km: float = Field(..., gt=0)