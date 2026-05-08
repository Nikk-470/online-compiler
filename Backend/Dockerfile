# Use the official Node.js image
FROM node:18-alpine

# Install Docker CLI inside the container so the backend can run user code
RUN apk add --no-cache docker-cli

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Expose the port your server runs on
EXPOSE 5000

# Start the application
CMD ["node", "app.js"]