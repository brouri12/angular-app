#!/bin/bash

#==============================================================================
# Spring Initializr Project Generator Script
# E-Learning Platform - Microservices
#==============================================================================
# This script generates 4 Spring Boot projects using Spring Initializr:
# 1. formation-service (port 8081)
# 2. quiz-badge-service (port 8082)
# 3. eureka-server (port 8761)
# 4. api-gateway (port 8080)
#
# All projects use:
# - Java 17
# - Spring Boot 3.2.1
# - Maven
# - GroupId: com.elearning
#==============================================================================

set -e

# Configuration
SPRING_INITIALIZR_URL="https://start.spring.io"
JAVA_VERSION="17"
SPRING_BOOT_VERSION="3.2.1"
MAVEN_VERSION="maven"
GROUP_ID="com.elearning"
OUTPUT_DIR="elearning-platform"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Create output directory
create_output_dir() {
    print_info "Creating output directory: $OUTPUT_DIR"
    mkdir -p "$OUTPUT_DIR"
    cd "$OUTPUT_DIR"
    print_success "Output directory created"
}

# Generate formation-service project
generate_formation_service() {
    print_info "Generating formation-service..."
    
    local deps="web,data-jpa,mysql,lombok,eureka-client,actuator,validation,devtools"
    
    curl -sL "$SPRING_INITIALIZR_URL/starter.zip" \
        -d "artifactId=formation-service" \
        -d "groupId=$GROUP_ID" \
        -d "version=1.0.0" \
        -d "name=formation-service" \
        -d "description=Formation+Management+Service" \
        -d "packageName=com.elearning.formation" \
        -d "type=$MAVEN_VERSION" \
        -d "javaVersion=$JAVA_VERSION" \
        -d "springBootVersion=$SPRING_BOOT_VERSION" \
        -d "dependencies=$deps" \
        -o "formation-service.zip"
    
    unzip -q -o formation-service.zip -d "formation-service-temp"
    rm -rf "formation-service"
    mv "formation-service-temp" "formation-service"
    rm "formation-service.zip"
    
    print_success "formation-service generated successfully"
}

# Generate quiz-badge-service project
generate_quiz_badge_service() {
    print_info "Generating quiz-badge-service..."
    
    local deps="web,data-jpa,mysql,lombok,eureka-client,actuator,validation,devtools"
    
    curl -sL "$SPRING_INITIALIZR_URL/starter.zip" \
        -d "artifactId=quiz-badge-service" \
        -d "groupId=$GROUP_ID" \
        -d "version=1.0.0" \
        -d "name=quiz-badge-service" \
        -d "description=Quiz+and+Badge+Service" \
        -d "packageName=com.elearning.quizbadge" \
        -d "type=$MAVEN_VERSION" \
        -d "javaVersion=$JAVA_VERSION" \
        -d "springBootVersion=$SPRING_BOOT_VERSION" \
        -d "dependencies=$deps" \
        -o "quiz-badge-service.zip"
    
    unzip -q -o quiz-badge-service.zip -d "quiz-badge-service-temp"
    rm -rf "quiz-badge-service"
    mv "quiz-badge-service-temp" "quiz-badge-service"
    rm "quiz-badge-service.zip"
    
    print_success "quiz-badge-service generated successfully"
}

# Generate eureka-server project
generate_eureka_server() {
    print_info "Generating eureka-server..."
    
    local deps="eureka-server,actuator"
    
    curl -sL "$SPRING_INITIALIZR_URL/starter.zip" \
        -d "artifactId=eureka-server" \
        -d "groupId=$GROUP_ID" \
        -d "version=1.0.0" \
        -d "name=eureka-server" \
        -d "description=Eureka+Server+Service+Discovery" \
        -d "packageName=com.elearning.eureka" \
        -d "type=$MAVEN_VERSION" \
        -d "javaVersion=$JAVA_VERSION" \
        -d "springBootVersion=$SPRING_BOOT_VERSION" \
        -d "dependencies=$deps" \
        -o "eureka-server.zip"
    
    unzip -q -o eureka-server.zip -d "eureka-server-temp"
    rm -rf "eureka-server"
    mv "eureka-server-temp" "eureka-server"
    rm "eureka-server.zip"
    
    print_success "eureka-server generated successfully"
}

# Generate api-gateway project
generate_api_gateway() {
    print_info "Generating api-gateway..."
    
    local deps="gateway,eureka-client,actuator"
    
    curl -sL "$SPRING_INITIALIZR_URL/starter.zip" \
        -d "artifactId=api-gateway" \
        -d "groupId=$GROUP_ID" \
        -d "version=1.0.0" \
        -d "name=api-gateway" \
        -d "description=API+Gateway" \
        -d "packageName=com.elearning.gateway" \
        -d "type=$MAVEN_VERSION" \
        -d "javaVersion=$JAVA_VERSION" \
        -d "springBootVersion=$SPRING_BOOT_VERSION" \
        -d "dependencies=$deps" \
        -o "api-gateway.zip"
    
    unzip -q -o api-gateway.zip -d "api-gateway-temp"
    rm -rf "api-gateway"
    mv "api-gateway-temp" "api-gateway"
    rm "api-gateway.zip"
    
    print_success "api-gateway generated successfully"
}

# Main execution
main() {
    echo "============================================"
    echo "  E-Learning Platform - Project Generator"
    echo "============================================"
    echo ""
    print_info "Generating 4 Spring Boot microservices..."
    print_info "Java Version: $JAVA_VERSION"
    print_info "Spring Boot Version: $SPRING_BOOT_VERSION"
    print_info "GroupId: $GROUP_ID"
    echo ""
    
    # Create output directory
    create_output_dir
    
    # Generate all projects
    echo ""
    print_info "Starting project generation..."
    echo ""
    
    generate_formation_service
    generate_quiz_badge_service
    generate_eureka_server
    generate_api_gateway
    
    # Summary
    echo ""
    echo "============================================"
    echo "  Generation Complete!"
    echo "============================================"
    echo ""
    print_success "All 4 projects generated successfully!"
    echo ""
    echo "Project structure:"
    echo "  $OUTPUT_DIR/"
    echo "  ├── formation-service/    (port 8081)"
    echo "  ├── quiz-badge-service/   (port 8082)"
    echo "  ├── eureka-server/        (port 8761)"
    echo "  └── api-gateway/          (port 8080)"
    echo ""
    print_info "To build the projects, run: mvn clean package"
    print_info "To start Eureka first: cd eureka-server && mvn spring-boot:run"
    print_info "Then start other services in any order"
    echo ""
}

# Execute main function
main "$@"
