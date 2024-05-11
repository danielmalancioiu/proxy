# Use an official nginx image
FROM nginx:alpine

# Remove the default nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy static resources to nginx serving directory
COPY . /usr/share/nginx/html

# Expose port for the HTTP server
EXPOSE 80
