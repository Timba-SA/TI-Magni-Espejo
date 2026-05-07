FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install dependencies first
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose API port
EXPOSE 8000

# Auto-seed on startup and then run uvicorn
# The seed script already checks if data exists before inserting
CMD python scripts/seed_db.py && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
