bold=$(shell (tput bold))
normal=$(shell (tput sgr0))

help:
	@echo "${bold}install${normal}\n\t Installs the whole appplication.\n"
	@echo "${bold}uninstall${normal}\n\t Stops and removes all containers and drops the database.\n"
	@echo "${bold}start${normal}\n\t Starts the application.\n"
	@echo "${bold}stop${normal}\n\t Stops the application.\n"
	@echo "${bold}db.connect${normal}\n\t Connects to the Postgres database.\n"

start:
	@sudo docker-compose up --build -d
	sleep 30

stop:
	@sudo docker-compose down -v
	@sudo docker-compose rm -v

uninstall: stop
	@sudo rm -rf postgres-data
	@sudo rm -rf node_modules
	@sudo rm -rf es-data

install: uninstall set_es_data start db.install es.install

set_es_data:
	mkdir es-data
	@sudo chown 1000:root ./es-data

db.connect:
	docker-compose exec postgres /bin/bash -c 'psql -U postgres'

db.install:
	docker-compose exec postgres /bin/bash -c 'psql -U postgres -h localhost -f data/db.sql'

es.install:
	docker-compose exec elasticsearch /bin/bash -c "curl -X PUT 'http://localhost:9200/es-topic' -H 'Content-Type: application/json' -d @data/es-index.json"
	docker-compose exec elasticsearch /bin/bash -c "curl -X PUT 'http://localhost:9200/es-msg' -H 'Content-Type: application/json' -d @data/es-index2.json"
	docker-compose exec elasticsearch /bin/bash -c "curl -X POST 'http://localhost:9200/es-topic/_bulk' -H 'Content-Type: application/json' --data-binary @data/es-data.json"
	docker-compose exec elasticsearch /bin/bash -c "curl -X POST 'http://localhost:9200/es-msg/_bulk' -H 'Content-Type: application/json' --data-binary @data/es-data2.json"
