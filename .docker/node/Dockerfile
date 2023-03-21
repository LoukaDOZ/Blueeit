FROM node:latest
WORKDIR /usr/app
COPY ./node/package.json .
RUN npm install --quiet
COPY ./node/. .
