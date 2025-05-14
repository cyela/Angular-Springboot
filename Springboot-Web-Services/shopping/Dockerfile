# Stage 1: Build the application using Maven with JDK 21
FROM maven:3.9.6-eclipse-temurin-21 AS build

# Set the working directory
WORKDIR /app

# Copy pom.xml and the source code
COPY pom.xml .
COPY src ./src

# Install dependencies and build the application (skip tests)
RUN mvn clean install -DskipTests


# Stage 2: Use Maven + JDK 21 runtime to run the app directly
FROM maven:3.9.6-eclipse-temurin-21 AS runtime

# Set the working directory
WORKDIR /app

# Copy everything from the build stage
COPY --from=build /app /app

# Expose port 9090 (Spring Boot app)
EXPOSE 9090

# Run the Spring Boot app directly using Maven
ENTRYPOINT ["mvn", "spring-boot:run"]

