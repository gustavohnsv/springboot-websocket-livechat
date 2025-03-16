FROM ubuntu:latest AS build
WORKDIR /app
RUN apt-get update
RUN apt-get install openjdk-17-jdk -y
COPY . .
RUN apt-get install maven -y
RUN mvn clean install

FROM node:16 AS frontend
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=build /app/target/livechat-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]