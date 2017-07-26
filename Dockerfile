FROM node:8

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Bundle app source
COPY . /usr/src/app

# Install app dependencies
RUN npm install

# Install postgresql to execute initial script for database
RUN touch /etc/apt/sources.list.d/pgdg.list
RUN echo deb http://apt.postgresql.org/pub/repos/apt/ jessie-pgdg main >> /etc/apt/sources.list.d/pgdg.list
RUN wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
RUN apt-get update
RUN apt-get install -y postgresql-9.6 postgresql-contrib-9.6
RUN su - postgres -c '/usr/lib/postgresql/9.6/bin/pg_ctl -D /var/lib/postgresql/9.6/main -l logfile start'
# RUN su - postgres -c '/usr/lib/postgresql/9.6/bin/pg_ctl -D /var/lib/postgresql/9.6/main/ -o "-c config_file=/etc/postgresql/9.6/main/postgresql.conf" start'
