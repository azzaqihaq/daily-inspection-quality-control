setup:
	composer install
	cp .env.example .env
	php artisan key:generate
	npm install

db-refresh:
	php artisan migrate:fresh

start:
	npm run dev && php artisan serve