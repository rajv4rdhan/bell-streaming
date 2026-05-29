# Use an official Maven image to build the application
FROM maven:3.8.5-openjdk-17 AS build

WORKDIR /app

COPY packages/thumbnail-generator/pom.xml ./pom.xml

COPY packages/thumbnail-generator/src ./src

RUN mvn clean install

FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

COPY --from=build /app/target/*.jar ./app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
