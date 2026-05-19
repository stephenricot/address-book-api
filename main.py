import logging
from fastapi import FastAPI, Depends, HTTPException, status   # status is already imported
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List

from database import SessionLocal, Address
from schemas import AddressCreate, AddressUpdate, AddressResponse, NearbyQuery
from utils import haversine

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Address Book API", description="Store and find addresses by distance")

# Allow UI (served from same origin) to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --------------------- API Endpoints ---------------------

@app.post("/addresses", response_model=AddressResponse, status_code=status.HTTP_201_CREATED)
def create_address(address: AddressCreate, db: Session = Depends(get_db)):
    """Create a new address."""
    db_address = Address(**address.dict())
    db.add(db_address)
    db.commit()
    db.refresh(db_address)
    logger.info(f"Created address with id {db_address.id}")
    return db_address

@app.get("/addresses", response_model=List[AddressResponse])
def list_addresses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all addresses (paginated)."""
    addresses = db.query(Address).offset(skip).limit(limit).all()
    return addresses

@app.get("/addresses/{address_id}", response_model=AddressResponse)
def get_address(address_id: int, db: Session = Depends(get_db)):
    """Get a single address by ID."""
    address = db.query(Address).filter(Address.id == address_id).first()
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
    return address

@app.put("/addresses/{address_id}", response_model=AddressResponse)
def update_address(address_id: int, address_update: AddressUpdate, db: Session = Depends(get_db)):
    """Update an existing address."""
    address = db.query(Address).filter(Address.id == address_id).first()
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
    
    update_data = address_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(address, field, value)
    
    db.commit()
    db.refresh(address)
    logger.info(f"Updated address {address_id}")
    return address

@app.post("/addresses/nearby", response_model=List[AddressResponse])
def find_nearby(query: NearbyQuery, db: Session = Depends(get_db)):
    """
    Find all addresses within distance_km km of the given coordinates.
    """
    all_addresses = db.query(Address).all()
    result = []
    for addr in all_addresses:
        dist = haversine(query.lat, query.lon, addr.latitude, addr.longitude)
        if dist <= query.distance_km:
            result.append(addr)
    logger.info(f"Nearby search returned {len(result)} addresses")
    return result

# Serve the static UI (HTML, CSS, JS)
app.mount("/static", StaticFiles(directory="static", html=True), name="static")

@app.get("/")
def root():
    # Redirect to the UI
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url="/static/index.html")