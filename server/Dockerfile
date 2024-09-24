# Use an official Node.js runtime as the base image
FROM node:20.15-slim

# Set the working directory inside the container
WORKDIR /

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the WebSocket port (e.g., 8080)
EXPOSE 8080
EXPOSE 3003
# Start the server
CMD ["node", "index.js"]
