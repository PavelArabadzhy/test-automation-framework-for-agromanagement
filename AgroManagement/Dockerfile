# Указываем синтаксис (необязательно, но помогает некоторым линтерам)
# syntax=docker/dockerfile:1

# ——— Сборочный этап ———
FROM maven:3.9.0-eclipse-temurin-17 AS build
WORKDIR /app

# Копируем только pom + исходники
COPY pom.xml .
COPY src ./src

# Собираем приложение, пропуская тесты
RUN mvn clean package -DskipTests

# ——— Финальный этап ———
FROM eclipse-temurin:17-jre
WORKDIR /app

# Берем любой JAR из target и называем его app.jar
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
