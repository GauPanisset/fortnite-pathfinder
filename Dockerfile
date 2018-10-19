FROM node:8

WORKDIR /app
COPY package.json /app
RUN \
  apt-get update && \
  apt-get install -y python python-dev python-pip python-virtualenv && \
  rm -rf /var/lib/apt/lists/*
RUN npm install
COPY . /app

EXPOSE 8080

CMD ["node", "server.js"]
