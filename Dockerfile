# download a base image
FROM node:20.11.1-alpine

ARG JWT_SECRET
ARG DATASOURCE_PASS

ENV SPRING_DATASOURCE_PASSWORD=${DATASOURCE_PASS}
ENV JWT_SECRET=${JWT_SECRET}

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

# copy both 'package.json' and 'package-lock.json' (if available)
COPY package*.json ./
COPY package-lock.json ./

# install project dependencies
RUN npm install

# copy project files and folders to the current working directory (i.e. 'app' folder)
COPY . .

# open the port on which the server will start
EXPOSE 5173

# run the front end server
CMD [ "npm", "run", "dev" ]