# Stage 1: Build the application
FROM maven:3.9.6-eclipse-temurin-21 AS build

WORKDIR /app

# Copy all project files
COPY . .

# Make Maven wrapper executable
RUN chmod +x mvnw

# Build the application
RUN ./mvnw clean package -DskipTests

# Stage 2: Runtime image
FROM eclipse-temurin:21-jre

WORKDIR /app

# Copy the built JAR
COPY --from=build /app/target/backend-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
