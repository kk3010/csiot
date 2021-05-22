FROM node:latest AS packaging

RUN mkdir -p /app
WORKDIR /app

COPY package.json .

RUN npm i 

FROM packaging

COPY . /app

ENV NODE_ENV production



RUN npm run build

CMD ["node", "./dist", "-d", "http://emulator:9292/gpios/led_green", "-s", "eu-central-1", "-e", "a2rkqhd4hxz5py-ats.iot.eu-central-1.amazonaws.com", "-r", "/certs/root-CA.crt", "-c", "/certs/temp_sensor_1.cert.pem", "-k", "/certs/temp_sensor_1.private.key", "-C", "sdk-nodejs-5dff24b9-16b2-4d24-aaff-2365f86a5757", "-t", "topic_1"]
