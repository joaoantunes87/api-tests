call rm -r reports/*
call docker-compose rm -f -s
call docker-compose up --build --abort-on-container-exit
