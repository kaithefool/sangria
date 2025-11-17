FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 3000
EXPOSE 9229
CMD [ "npx", "tsx", "--inspect=0.0.0.0:9229", "bin/www" ]