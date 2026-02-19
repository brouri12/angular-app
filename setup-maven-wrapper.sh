#!/bin/bash
# Script pour ajouter le Maven Wrapper aux microservices (sans Maven installé)
# Usage: bash setup-maven-wrapper.sh

set -e

WRAPPER_URL="https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper-distribution/3.3.4/maven-wrapper-distribution-3.3.4-only-script.zip"
SERVICES=("api-gateway" "eureka-server" "formation-service" "quiz-badge-service")
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Téléchargement du Maven Wrapper (only-script)..."

# Télécharger avec curl ou wget
if command -v curl &>/dev/null; then
    curl -sL -o /tmp/maven-wrapper.zip "$WRAPPER_URL"
elif command -v wget &>/dev/null; then
    wget -q -O /tmp/maven-wrapper.zip "$WRAPPER_URL"
else
    echo "Erreur: curl ou wget requis pour télécharger le wrapper"
    exit 1
fi

echo "Installation dans chaque service..."

for service in "${SERVICES[@]}"; do
    if [[ -d "$SCRIPT_DIR/$service" ]]; then
        cd "$SCRIPT_DIR/$service"
        unzip -o -q /tmp/maven-wrapper.zip
        echo "  ✓ $service"
    fi
done

rm -f /tmp/maven-wrapper.zip
echo ""
echo "Maven Wrapper installé! Utilisez: ./mvnw clean compile"
echo "  (ou mvnw.cmd sous Windows CMD)"
