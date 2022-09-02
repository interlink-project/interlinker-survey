FROM python:3.9-slim-buster as builder
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
RUN apt-get update
RUN pip3 install poetry==1.2.0
RUN poetry config virtualenvs.create false
WORKDIR /app/
# Copy poetry.lock* in case it doesn't exist in the repo
COPY ./app/pyproject.toml ./app/poetry.lock* /app/
COPY ./app /app
ENV PYTHONPATH=/app

FROM builder as dev
RUN poetry install --no-root
RUN chmod +x ./start-dev.sh
CMD ["bash", "./start-dev.sh"]

FROM builder as prod
RUN poetry install --no-root --no-dev
RUN chmod +x ./start-prod.sh
CMD ["bash", "./start-prod.sh"]