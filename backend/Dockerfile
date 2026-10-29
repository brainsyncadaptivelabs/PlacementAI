# Stage 1: Build the application with layer & dependency caching
FROM maven:3.9.6-eclipse-temurin-21 AS build

WORKDIR /app

# 1. Copy POM and wrapper first for Docker layer caching
COPY mvnw pom.xml ./
COPY .mvn .mvn/
RUN chmod +x mvnw

# 2. Cache Maven repository across builds (never re-download dependencies)
RUN --mount=type=cache,target=/root/.m2 ./mvnw dependency:go-offline -B || true

# 3. Copy source and package jar using incremental build
COPY src ./src
RUN --mount=type=cache,target=/root/.m2 ./mvnw package -DskipTests -B

# Stage 2: Runtime image
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
