PID=.build/pids
DB_HOST := $(if $(DB_HOST),$(DB_HOST),"http://172.30.100.109")
DB_USER := $(if $(DB_USER),$(DB_USER),"admin")
DB_PASSWORD := $(if $(DB_PASSWORD),$(DB_PASSWORD),"password")
KAFKA_HOST := $(if $(KAFKA_HOST),$(KAFKA_HOST),"172.30.100.108")

all: run

agent-docker:
	docker build -f images/agent.Dockerfile --force-rm -t registry.smartm2m.co.kr/slippy-agent:latest .

dockers: agent-docker
	docker build -f images/service.Dockerfile --force-rm -t registry.smartm2m.co.kr/slippy-service:latest .
	docker build -f images/server.Dockerfile --force-rm -t registry.smartm2m.co.kr/slippy-platform:latest .

net:
	KAFKA_HOST=${KAFKA_HOST} DB_HOST=${DB_HOST} DB_USER=${DB_USER} DB_PASSWORD=${DB_PASSWORD} docker-compose -f docker-compose.yaml up -d

down:
	docker-compose -f docker-compose.yaml down --remove-orphans

reload:
	docker-compose restart

run:
	mkdir -p .build
	KAFKA_HOST=${KAFKA_HOST} DB_HOST=${DB_HOST} DB_USER=${DB_USER} DB_PASSWORD=${DB_PASSWORD}  node node_modules/nodemon/bin/nodemon.js --config .nodemon.json server.ts & echo "$$!" > $(PID)
	make -C service run

stop:
	kill -2 `cat $(PID)`

clean: stop
	rm -rf .build

kafka-pub:
	kafkacat -P -b 172.30.100.108:9092 -t t1

kafka-sub:
	kafkacat -C -b 172.30.100.108:9092 -t t1 -o 0

.PHONY:

.ONESHELL:
