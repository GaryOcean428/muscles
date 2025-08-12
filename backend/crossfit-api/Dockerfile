# Use Python 3.11 slim image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Install production dependencies
RUN pip install --no-cache-dir gunicorn psycopg2-binary

# Copy application code
COPY . .

# Create non-root user
RUN useradd --create-home --shell /bin/bash fitforge && \
    chown -R fitforge:fitforge /app

# Create directories for logs and uploads
RUN mkdir -p /app/logs /app/uploads && \
    chown -R fitforge:fitforge /app/logs /app/uploads

# Switch to non-root user
USER fitforge

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "--worker-class", "sync", "--timeout", "30", "--keep-alive", "2", "--max-requests", "1000", "--max-requests-jitter", "50", "--preload", "src.main:app"]

