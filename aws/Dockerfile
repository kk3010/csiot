FROM node:latest AS packaging

RUN mkdir -p /app
WORKDIR /app

COPY package.json .

RUN npm i 

FROM packaging

COPY . /app

ENV NODE_ENV production



RUN npm run build

CMD ["node", "./dist"]
