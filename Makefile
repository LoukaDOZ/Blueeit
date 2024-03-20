bold=$(shell (tput bold))
normal=$(shell (tput sgr0))

run: set_es_data build start db-install es-install

build:
	docker compose build

start:
	docker compose up -d
	sleep 10

stop:
	docker compose down

clean:
	@sudo rm -rf postgres-data
	@sudo rm -rf node_modules
	@sudo rm -rf es-data
	docker rmi blueeit-web blueeit-postgres blueeit-elasticsearch

set_es_data:
	mkdir es-data
	@sudo chown 1000:root ./es-data

db-install:
	docker-compose exec postgres /bin/bash -c 'psql -U postgres -h localhost -f data/db.sql'

es-install:
	docker-compose exec elasticsearch /bin/bash -c "curl -X PUT 'http://localhost:9200/es-topic' -H 'Content-Type: application/json' -d @data/es-index.json"
	docker-compose exec elasticsearch /bin/bash -c "curl -X PUT 'http://localhost:9200/es-msg' -H 'Content-Type: application/json' -d @data/es-index2.json"
	docker-compose exec elasticsearch /bin/bash -c "curl -X POST 'http://localhost:9200/es-topic/_bulk' -H 'Content-Type: application/json' --data-binary @data/es-data.json"
	docker-compose exec elasticsearch /bin/bash -c "curl -X POST 'http://localhost:9200/es-msg/_bulk' -H 'Content-Type: application/json' --data-binary @data/es-data2.json"
