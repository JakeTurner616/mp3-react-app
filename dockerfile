# Use an official Python image as a base
FROM python:3.9-slim

# Set the working directory to /app
WORKDIR /app

# Copy the requirements file
COPY requirements.txt .

# Install the dependencies
RUN pip install -r requirements.txt

# Copy the application code
COPY backend.py .

# Expose the port the app will run on
EXPOSE 50616

#install gunicorn
RUN pip install gunicorn

# Run Gunicorn when the container starts on port 50616
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:50616", "backend:app"]