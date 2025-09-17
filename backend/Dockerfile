# Multi-stage build for KraiNode
FROM node:18-alpine AS frontend-builder

# Accept build arguments for frontend environment variables
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_API_BASE

# Set working directory
WORKDIR /app/web

# Copy package files
COPY web/package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm install

# Copy source code
COPY web/ ./

# Set environment variables for build
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_API_BASE=$VITE_API_BASE

# Build frontend
RUN npm run build

# Python backend stage
FROM python:3.11-slim AS backend

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PIP_NO_CACHE_DIR=1
ENV PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy backend requirements
COPY backend/pyproject.toml ./

# Install Python dependencies
RUN pip install --no-cache-dir -e .

# Copy backend source code
COPY backend/ ./

# Copy built frontend from previous stage
COPY --from=frontend-builder /app/web/dist ./static

# Create non-root user
RUN useradd --create-home --shell /bin/bash app \
    && chown -R app:app /app
USER app

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/healthz || exit 1

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
