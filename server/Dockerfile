FROM node:22-alpine

WORKDIR /app/server

COPY package*.json ./
RUN npm install
COPY . .
RUN node bin/setup

EXPOSE 3000
CMD [ "node", "bin/www" ]