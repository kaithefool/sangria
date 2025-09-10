FROM node:22-alpine

WORKDIR /app

COPY package*.json assets/package*.json server/package*.json ./
RUN npm install
COPY . .

RUN cd assets && npm run build
RUN node server/bin/setup

EXPOSE 3000
CMD [ "node", "server/bin/www" ]