.PHONY: help dev build clean docker-dev docker-up docker-down docker-logs

help: ## Show available commands
	@echo "KraiNode - JSON-RPC Playground"
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

dev: ## Start the Vite development server
	cd web && npm install && npm run dev

build: ## Build the production bundle
	cd web && npm install && npm run build

clean: ## Remove build artifacts and dependencies
	rm -rf web/dist web/node_modules

docker-dev: ## Start development environment with Docker
	docker compose -f docker-compose-dev.yml up --build

docker-up: ## Start production stack (Caddy + app)
	docker compose up -d --build

docker-down: ## Stop production stack
	docker compose down

docker-logs: ## Follow logs from running containers
	docker compose logs -f