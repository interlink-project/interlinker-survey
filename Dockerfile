FROM node:13.12.0-alpine as frontendbuilder
WORKDIR /react
COPY ./react /react
RUN npm ci
RUN npm run build

FROM python:3.8 as builder
WORKDIR /app/
# Install Poetry
RUN curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py | POETRY_HOME=/opt/poetry python && \
    cd /usr/local/bin && \
    ln -s /opt/poetry/bin/poetry && \
    poetry config virtualenvs.create false
COPY ./app /app
ENV PYTHONPATH=/app

FROM builder as dev
WORKDIR /app/
COPY --from=frontendbuilder /react/build /app/react
RUN poetry install --no-root
RUN chmod +x ./start-dev.sh
CMD ["bash", "./start-dev.sh"]

FROM builder as prod
WORKDIR /app/
COPY --from=frontendbuilder /react/build /app/react
RUN poetry install --no-root --no-dev
RUN chmod +x ./start-prod.sh
CMD ["bash", "./start-prod.sh"]