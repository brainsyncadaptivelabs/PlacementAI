# Stage 1: Build the application
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copy dependency configuration and wrapper
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .

# Resolve and cache dependencies
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# Copy remaining source code and build package
COPY . .
RUN ./mvnw clean package -DskipTests

# Stage 2: Create the execution image
FROM eclipse-temurin:21
WORKDIR /app
COPY --from=build /app/target/backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
