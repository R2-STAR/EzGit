FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    git \
    curl \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

RUN pip install semgrep
RUN npm install -g snyk

COPY . .

EXPOSE 8000
