SHELL := /bin/bash

.PHONY: down
down: ## Stops all containers and removes volumes
	docker-compose -f docker-compose.yml -f docker-compose.integrated.yml -f docker-compose.solodev.yml down --volumes --remove-orphans

.devbuild: devbuild
devbuild: ## Build development containers
	cd react && npm ci && npm run build
	docker-compose -f docker-compose.yml -f docker-compose.solodev.yml build

.PHONY: prodbuild
prodbuild: ## Build production containers
	cd react && npm ci && npm run build
	docker-compose -f docker-compose.yml build

.PHONY: solodev
solodev: down ## Start solo development containers
	docker-compose -f docker-compose.yml -f docker-compose.solodev.yml up -d

.PHONY: up
up: down ## Start integrated development containers
	docker-compose -f docker-compose.yml -f docker-compose.integrated.yml up -d

.PHONY: prod
prod: down ## Start production containers
	docker-compose -f docker-compose.yml up

.PHONY: tests
tests: ## Start tests
	#docker-compose exec survey pytest --cov=app --cov-report=term-missing app/tests
	docker-compose exec survey pytest app/tests

.PHONY: testing
testing: devbuild solodev tests down ## Start tests
