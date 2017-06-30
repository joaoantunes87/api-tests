FROM node:boron

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Bundle app source
COPY . /usr/src/app

COPY wait-for-it.sh wait-for-it.sh

# Install app dependencies
RUN npm install
