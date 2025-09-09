# syntax=docker/dockerfile:1

FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Install static server
RUN npm i -g serve@14

# Runtime config
ENV PORT=8080
EXPOSE 8080

# Build on container start so REACT_APP_* env vars from Dokku are embedded
CMD ["sh","-c","npm run build && serve -s build -l $PORT"]

