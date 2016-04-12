.PHONY: run
run:
	make build dependencies test apidoc start

.PHONY: dev
dev:
	make build dependencies test apidoc start-dev

.PHONY: build
build:
	docker build --rm=true -t sebflipper/centos-security-advisories-api .

.PHONY: dependencies
dependencies:
	docker-compose run --rm centosSecurityAdvisories npm install

.PHONY: test
test:
	docker-compose run --rm centosSecurityAdvisories npm run-script coverage

.PHONY: apidoc
apidoc:
	docker-compose run --rm centosSecurityAdvisories npm run-script apidoc

.PHONY: start
start:
	docker-compose up -d

.PHONY: start-dev
start-dev:
	COMPOSE_FILE=docker-compose-dev.yml \
	make start

.PHONY: clean
clean:
	-docker-compose kill
	-docker-compose rm -f
	-rm -Rf .cache/*.gz apidoc coverage node_modules
	-docker rmi "sebflipper/centos-security-advisories-api"

.PHONY: push
push:
	docker push sebflipper/centos-security-advisories-api
