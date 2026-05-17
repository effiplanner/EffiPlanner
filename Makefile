SHELL := /bin/bash

.PHONY: setup dev test lint format db-up db-down db-reset prisma-generate prisma-migrate prisma-seed

setup: db-up
	npm install
	npx prisma generate
	npx prisma migrate dev --name init
	npx prisma db seed

dev: db-up
	npx prisma migrate dev
	npm run dev

test:
	npm run test

lint:
	npm run lint

format:
	npm run format

db-up:
	docker compose up -d

db-down:
	docker compose down

db-reset: db-down
	docker compose up -d
	npx prisma migrate reset --force

prisma-generate:
	npx prisma generate

prisma-migrate:
	npx prisma migrate dev

prisma-seed:
	npx prisma db seed
