# Address Book App (FastAPI + SQLite + UI)

A full‑stack address book that lets you **create, update, delete, and search addresses by distance**.  
Includes a clean web UI and a RESTful API with automatic Swagger documentation.

## Features

- ✅ Store addresses with coordinates (latitude, longitude)
- ✅ SQLite database (no extra setup)
- ✅ Validation: coordinates ranges, non‑empty fields
- ✅ Find addresses within X km of any point (Haversine formula)
- ✅ User‑friendly web interface
- ✅ Full API documentation at `/docs`

## How to Run (Step‑by‑Step)

### 1. Clone or download the project

Make sure all files are in the structure shown above.

### 2. Open a terminal inside the `address_book` folder

### 3. Create a virtual environment (recommended)

```bash
python -m venv venv
source venv/bin/activate      # On Windows: venv\Scripts\activate