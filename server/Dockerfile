FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .
RUN node server/bin/setup

EXPOSE 3000
CMD [ "node", "server/bin/www" ]