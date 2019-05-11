FROM node:10-alpine

WORKDIR /home/node/slippy

COPY service .
RUN rm -rf node_modules
RUN npm i -g @angular/cli

RUN npm install

EXPOSE 4200/tcp

ENTRYPOINT ["npm", "start"]
