FROM node:10-alpine

WORKDIR /home/node/slippy

COPY component component
COPY core core
COPY lib lib
COPY LICENSE.txt LICENSE.txt
COPY console-reporter.js console-reporter.js
COPY util.js util.js
COPY package.json package.json
COPY rest rest
COPY testing testing
COPY tsconfig.json tsconfig.json
COPY server.ts server.ts
COPY .nodemon.json .nodemon.json
COPY config.yaml config.yaml


RUN apk add --virtual builds-deps build-base python

RUN npm i -g typescript ts-node
RUN npm install

EXPOSE 8000/tcp

ENTRYPOINT ["npm", "start"]
