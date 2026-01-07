# Build stage
FROM eclipse-temurin:25-jdk AS build
WORKDIR /app

# Install Gradle
RUN apt-get update && \
    apt-get install -y wget unzip && \
    wget https://services.gradle.org/distributions/gradle-9.2.1-bin.zip && \
    unzip gradle-9.2.1-bin.zip -d /opt && \
    rm gradle-9.2.1-bin.zip && \
    ln -s /opt/gradle-9.2.1/bin/gradle /usr/bin/gradle

# Copy gradle files first for better caching
COPY build.gradle settings.gradle ./
COPY gradle ./gradle
COPY gradlew ./

# Copy source code
COPY src ./src

# Build the application
RUN ./gradlew clean build -x test --no-daemon

# Runtime stage
FROM eclipse-temurin:25-jre-alpine
WORKDIR /app

# Copy the built JAR from build stage
COPY --from=build /app/build/libs/*.jar app.jar

# Expose port 8080
EXPOSE 8080

# Set production profile as default
ENV SPRING_PROFILES_ACTIVE=prod

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
