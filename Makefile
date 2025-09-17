.PHONY: help build dev test clean docker-build docker-up docker-down

help: ## Show this help message
	@echo "KraiNode - JSON-RPC Proxy"
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

build: ## Build the frontend # Local build only
	cd web && npm install && npm run build

dev: ## Start development servers
	@echo "Starting development servers..."
	@echo "KraiNode: http://localhost:8000"
	@echo "Press Ctrl+C to stop"
	@trap 'kill %1 %2' INT; \
	cp env.dev.example .env && \
	docker compose -f docker-compose-dev.yml up --build -d
	wait

test: ## Run tests
	cd backend && pytest tests/ -v

test-coverage: ## Run tests with coverage
	cd backend && pytest tests/ --cov=app --cov-report=html

lint: ## Run linting
	cd backend && black app/ tests/ && isort app/ tests/ && flake8 app/ tests/
	cd web && npm run lint

docker-build: ## Build Docker image
	docker build -f backend/Dockerfile -t krainode:latest .

docker-up: ## Start services with Docker Compose
	docker compose -f docker-compose.yml up --build -d

docker-down: ## Stop Docker Compose services
	docker compose down

docker-logs: ## View Docker Compose logs
	docker compose logs -f

clean: ## Clean build artifacts
	rm -rf web/dist
	rm -rf web/node_modules
	rm -rf backend/__pycache__
	rm -rf backend/.pytest_cache
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete

install: ## Install dependencies
	cd backend && pip install -e .
	cd web && npm install

setup: ## Initial setup
	cp env.example .env
	cd krainode-rpc-proxy/web && cp env.example .env
	@echo "Edit .env file with your configuration"
	@echo "Then run 'make install' to install dependencies"

prod-build: ## Build for production
	docker build -f backend/Dockerfile -t krainode:latest .

prod-run: ## Run production container
	docker run -p 8000:8000 \
		-e CHAINS_CONFIG_FILE=chains.yaml \
		-e RATE_LIMIT_RPS=10 \
		krainode:latest

staging-build: ## Build for staging (same as production but with staging env)
	docker build -f backend/Dockerfile -t krainode:staging .

staging-run: ## Run staging container
	docker run -p 8000:8000 \
		-e CHAINS_CONFIG_FILE=chains.yaml \
		-e RATE_LIMIT_RPS=10 \
		-e API_HOST=staging.krainode.krissemmy.com \
		krainode:staging

staging-deploy: ## Deploy to staging environment
	@echo "Deploying to staging environment..."
	@echo "Make sure to update your .env file with staging values:"
	@echo "  - API_HOST=staging.krainode.krissemmy.com"
	@echo "  - SUPABASE_PROJECT_ID=your_project_id"
	@echo "  - VITE_SUPABASE_URL=https://your-project-id.supabase.co"
	@echo "  - VITE_SUPABASE_ANON_KEY=your_supabase_anon_key"
	@echo "  - DATABASE_URL=your_database_url"
	docker compose up --build -d

check: ## Check system requirements
	@echo "Checking system requirements..."
	@command -v python3 >/dev/null 2>&1 || { echo "Python 3 is required but not installed."; exit 1; }
	@command -v node >/dev/null 2>&1 || { echo "Node.js is required but not installed."; exit 1; }
	@command -v docker >/dev/null 2>&1 || { echo "Docker is required but not installed."; exit 1; }
	@echo "All requirements satisfied!"

status: ## Show service status
	@echo "Checking service status..."
	@curl -s http://localhost:8000/healthz >/dev/null && echo "✅ Backend is running" || echo "❌ Backend is not running"
	@curl -s http://localhost:8000 >/dev/null && echo "✅ Frontend is running" || echo "❌ Frontend is not running"
	@curl -s http://localhost:9090 >/dev/null && echo "✅ Prometheus is running" || echo "❌ Prometheus is not running"
	@curl -s http://localhost:3000 >/dev/null && echo "✅ Grafana is running" || echo "❌ Grafana is not running"
