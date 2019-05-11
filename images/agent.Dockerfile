FROM node:10-alpine

COPY component/app-engine/agent agent
WORKDIR agent

RUN rm -rf .code 

RUN npm install -g typescript
RUN npm urn build

EXPOSE 5400/tcp

ENTRYPOINT ["npm", "start"]