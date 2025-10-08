# Base Python image
FROM python:3.12-slim

# Working directory inside the container
WORKDIR /web

# Copy dependencies and install them
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the web files
COPY . .

# Expose Django’s default port
EXPOSE 8000

# Default command: run the Django dev server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]