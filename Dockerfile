FROM node:22-alpine

WORKDIR /app/server

COPY server/package*.json ./
RUN npm install
COPY server/. .
RUN node server/bin/setup

EXPOSE 3000
CMD [ "node", "server/bin/www" ]