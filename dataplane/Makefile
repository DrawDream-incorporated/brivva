# Brivva Dataplane Makefile
# =========================

.PHONY: dev build test docker docker-run push deploy clean help

# Configuration
IMAGE_NAME := brivva-dataplane
AWS_REGION := ap-northeast-2

# ============================================================================
# Development
# ============================================================================

## Run locally (requires .env file)
dev:
	@echo "Starting local development server..."
	@if [ -f .env ]; then set -a && source .env && set +a; fi && cargo run

## Build release binary
build:
	cargo build --release

## Run tests
test:
	cargo test

## Check code (no compile)
check:
	cargo check

## Format code
fmt:
	cargo fmt

## Lint with clippy
lint:
	cargo clippy -- -D warnings

# ============================================================================
# Docker
# ============================================================================

## Build Docker image
docker:
	docker build -t $(IMAGE_NAME) .

## Build and run Docker container (host:9090 -> container:8080)
docker-run: docker
	docker run -p 9090:8080 \
		--env-file .env \
		$(IMAGE_NAME)

## Run Docker with interactive shell
docker-shell: docker
	docker run -it --entrypoint /bin/bash \
		--env-file .env \
		$(IMAGE_NAME)

## Run Docker in detached mode
docker-up: docker
	docker run -d -p 9090:8080 \
		--name $(IMAGE_NAME) \
		--env-file .env \
		--restart unless-stopped \
		$(IMAGE_NAME)

## Stop and remove Docker container
docker-down:
	docker stop $(IMAGE_NAME) || true
	docker rm $(IMAGE_NAME) || true

## View Docker logs
docker-logs:
	docker logs -f $(IMAGE_NAME)

# ============================================================================
# Utilities
# ============================================================================

## Clean build artifacts
clean:
	cargo clean
	rm -rf target/

## Create .env from example
env:
	@if [ ! -f .env ]; then cp .env.example .env && echo "Created .env file. Please edit it."; else echo ".env already exists"; fi

## Show help
help:
	@echo "Brivva Dataplane Commands"
	@echo "========================="
	@echo ""
	@echo "Development:"
	@echo "  make dev          Run locally with cargo"
	@echo "  make build        Build release binary"
	@echo "  make test         Run tests"
	@echo "  make check        Check code without compiling"
	@echo "  make fmt          Format code"
	@echo "  make lint         Run clippy linter"
	@echo ""
	@echo "Docker:"
	@echo "  make docker       Build Docker image"
	@echo "  make docker-run   Build and run Docker container (9090:8080)"
	@echo "  make docker-shell Run container with shell"
	@echo "  make docker-up    Run container in detached mode"
	@echo "  make docker-down  Stop and remove container"
	@echo "  make docker-logs  View container logs"
	@echo ""
	@echo "Utilities:"
	@echo "  make clean        Remove build artifacts"
	@echo "  make env          Create .env from .env.example"
	@echo "  make help         Show this help"