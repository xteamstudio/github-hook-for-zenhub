FROM node:10.13-alpine
WORKDIR /usr/src/app
ENV NODE_ENV "production"
COPY ["package*.json", "yarn.lock", "tsconfig.json", "index.ts", "./"]
COPY src src
RUN chmod -R u+w /usr/src/app
RUN yarn install --production
EXPOSE 3000
CMD [ "npm", "start" ]
