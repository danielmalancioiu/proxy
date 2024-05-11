#!/bin/bash

docker start openwhisk

cd cache-service
docker build -t openwhisk-proxy .
cd ..

docker-compose up --build

cd functions
wsk action create fibonacci fibonacci.js
cd ..