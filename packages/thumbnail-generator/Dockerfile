# Use an official Maven image to build the application
FROM maven:3.8.5-openjdk-17 AS build

# Set the working directory
WORKDIR /app

# Copy the pom.xml
COPY packages/thumbnail-generator/pom.xml ./pom.xml

# Copy the source code
COPY packages/thumbnail-generator/src ./src

# Build the application
RUN mvn clean install

# Use a smaller base image for the final image
FROM eclipse-temurin:17-jre-alpine

# Set the working directory
WORKDIR /app

# Copy the jar file from the build stage
COPY --from=build /app/target/*.jar ./app.jar

# Expose the port the app runs on
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
