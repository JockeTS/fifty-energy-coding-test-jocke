# Use Node.js base image
FROM node:20-alpine

# Working directory inside the container
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the project files
COPY . .

# Expose React's dev port
EXPOSE 3000

# Default command: start the React dev server
# CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
CMD ["npm", "start", "--", "--host", "0.0.0.0"]