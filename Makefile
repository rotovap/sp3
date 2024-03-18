migrate_up:  
	migrate -database ${POSTGRESQL_URL} -path database/migrations up

migrate_down: 
	migrate -database ${POSTGRESQL_URL} -path database/migrations down

test: build
	go test -v ./models

# generate templ templates
gen:
	templ generate

# a rule looks like this:
# targets: dependencies
# 	command
# 
# so by putting migration_up and gen on the same line
# they are dependencies of build
build: migrate_up gen 
	go build 

run: build
	./sp3

.PHONY : migrate_up migrate_down test gen

