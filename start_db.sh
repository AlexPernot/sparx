#!/usr/bin/env sh

docker run -d --name sparx-db \
  -e POSTGRES_PASSWORD=secret \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=sparx \
  -e POSTGRES_INITDB_ARGS=--auth=scram-sha-256 \
  -e PGDATA=/var/lib/postgresql/data/pgdata \
  -p 5432:5432 \
  -v /Users/alex/WebstormProjects/sparx/data:/var/lib/postgresql/data \
  postgres:16.3-alpine
