# syntax=docker/dockerfile:1

# --- Build stage ---
FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build-time env via build args (provided by Dokku)
ARG REACT_APP_MTA_GTFS_API_KEY
ARG REACT_APP_BART_API_KEY
ARG REACT_APP_MUNI_API_KEY
ARG REACT_APP_AC_TRANSIT_TOKEN
ARG REACT_APP_MTA_BUS_API_KEY

# Ensure CRA sees the variables during build
ENV REACT_APP_MTA_GTFS_API_KEY=${REACT_APP_MTA_GTFS_API_KEY} \
    REACT_APP_BART_API_KEY=${REACT_APP_BART_API_KEY} \
    REACT_APP_MUNI_API_KEY=${REACT_APP_MUNI_API_KEY} \
    REACT_APP_AC_TRANSIT_TOKEN=${REACT_APP_AC_TRANSIT_TOKEN} \
    REACT_APP_MTA_BUS_API_KEY=${REACT_APP_MTA_BUS_API_KEY}

RUN npm run build

# --- Runtime stage ---
FROM node:18-alpine
WORKDIR /app

RUN npm i -g serve@14
COPY --from=build /app/build /app/build

# Bind to the port provided by Dokku at runtime
CMD ["sh","-c","serve -s build -l $PORT"]

