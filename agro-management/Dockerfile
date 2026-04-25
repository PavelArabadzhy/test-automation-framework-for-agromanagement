# Dockerfile syntax (optional, helps some linters)
# syntax=docker/dockerfile:1

# --- Build stage ---
FROM maven:3.9.0-eclipse-temurin-17 AS build
WORKDIR /app

# Copy pom and source files only
COPY pom.xml .
COPY src ./src

# Build application, skipping tests
RUN mvn clean package -DskipTests

# --- Runtime stage ---
FROM eclipse-temurin:17-jre
WORKDIR /app

# Copy built JAR from target as app.jar
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
