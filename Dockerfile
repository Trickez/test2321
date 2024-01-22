FROM node:14
WORKINGDIR /usr/src/app
COPY package*.json /src/index.js
RUN npm install
CMD ["npm", "start"]