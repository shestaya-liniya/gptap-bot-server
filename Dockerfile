FROM node:18.17.0-alpine
RUN apk update && apk add bash
WORKDIR /
COPY package*.json ./
RUN npm install --legacy-peer-deps
RUN npm install dotenv
RUN npm install -g nodemon
RUN npm install -g docker-compose
COPY . .
CMD npm run start