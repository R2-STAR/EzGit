.PHONY: setup dev dev-bg stop clean logs shell-backend shell-db rebuild test

setup:
	@echo "Starting GitAnalyzer for the first time..."
	docker compose build
	docker compose up -d postgres redis
	@echo "Waiting for Postgres to be ready..."
	sleep 5
	docker compose up -d backend worker frontend
	@echo "GitAnalyzer is running!"
	@echo "   Frontend : http://localhost:5173"
	@echo "   Backend  : http://localhost:8000"
	@echo "   API Docs : http://localhost:8000/docs"

dev:
	docker compose up

dev-bg:
	docker compose up -d

stop:
	docker compose down

clean:
	docker compose down -v
	@echo "All containers and volumes removed"

logs:
	docker compose logs -f backend worker

shell-backend:
	docker compose exec backend bash

shell-db:
	docker compose exec postgres psql -U gitanalyzer -d gitanalyzer

rebuild:
	docker compose up -d --build $(service)

test:
	docker compose exec backend pytest app/tests/ -v

