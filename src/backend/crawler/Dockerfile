FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    UV_PROJECT_ENVIRONMENT=/opt/venv

RUN pip install --no-cache-dir uv

WORKDIR /app
COPY requirements.txt .
RUN uv pip install --system -r requirements.txt

COPY . .

CMD ["python", "main.py"]
