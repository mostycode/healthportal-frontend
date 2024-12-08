# Fetching the latest node image on alpine linux
FROM node:alpine AS build
#FROM node:18-alpine3.17 as build

# Declaring env
ENV NODE_ENV development

# Setting up the work directory
WORKDIR /react-app

# Installing dependencies
COPY ./package*.json /react-app/

RUN npm install

# Copying all the files in our project
COPY . /react-app


# Starting our application
RUN npm run build

FROM nginx:latest

# Copy the built files from the previous stage
COPY --from=build /react-app/dist /usr/share/nginx/html
#COPY --from=build /react-app/dist /var/www/html/

# Expose port 80
EXPOSE 80

# Start the Nginx server
CMD ["nginx", "-g", "daemon off;"]
