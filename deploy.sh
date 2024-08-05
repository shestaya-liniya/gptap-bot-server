#!/bin/bash

# Create network
docker network create my-network

# Create volume
docker volume create db

# Run mysqldb container
docker run -d \
  --name mysqldb \
  --network my-network \
  -e MYSQL_ROOT_PASSWORD=${MYSQLDB_ROOT_PASSWORD} \
  -e MYSQL_DATABASE=${MYSQLDB_DATABASE} \
  -p ${MYSQLDB_LOCAL_PORT}:${MYSQLDB_DOCKER_PORT} \
  -v db:/var/lib/mysql \
  --restart always \
  mysql:5.7.44

# Run backend container
docker run -d \
  --name backend \
  --network my-network \
  -e DB_HOST=mysqldb \
  -e DB_USER=${MYSQLDB_USER} \
  -e DB_PASSWORD=${MYSQLDB_ROOT_PASSWORD} \
  -e DB_NAME=${MYSQLDB_DATABASE} \
  -e DB_PORT=${MYSQLDB_DOCKER_PORT} \
  -p ${NODE_REST_PORT}:${NODE_REST_PORT} \
  --restart always \
  bot-ai:latest