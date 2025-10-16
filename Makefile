# Build and run containers
up:
	docker compose up -d --build

# Run database migrations
migrate:
	docker compose exec web python manage.py migrate

test:
	docker compose exec web pytest

# Populate the database
seed:
	docker compose exec web python manage.py seed