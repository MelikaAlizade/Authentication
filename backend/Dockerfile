FROM node:22-alpine

WORKDIR /app
RUN apk update && apk add postgresql-client
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["node", "back.js"]