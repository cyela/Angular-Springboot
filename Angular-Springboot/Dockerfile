# Stage 1: Build the Angular application
FROM node:16 AS build

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the app source code
COPY . .

# Build the Angular app for production
RUN npm run build --prod

# Stage 2: Serve the Angular application using NGINX
FROM nginx:alpine

# Copy the built Angular app from the build stage
COPY --from=build /app/dist/shopping-app /usr/share/nginx/html

# Expose port 4200 for the Angular app
EXPOSE 4200

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]
