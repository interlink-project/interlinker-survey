FROM python:3.9-slim-buster as os-base
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
RUN apt-get update
RUN apt-get install -y curl

FROM os-base as poetry-base
RUN curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py | python -
ENV PATH="/root/.poetry/bin:$PATH"
RUN poetry config virtualenvs.create false
RUN apt-get remove -y curl

FROM poetry-base as builder
WORKDIR /app/
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