#!/bin/bash

echo "========================================"
echo "DEMARRAGE DU MICROSERVICE ABONNEMENT"
echo "========================================"
echo ""

echo "[1/3] Verification de Java..."
java -version
if [ $? -ne 0 ]; then
    echo "ERREUR: Java n'est pas installe ou pas dans le PATH"
    exit 1
fi
echo ""

echo "[2/3] Compilation du projet..."
mvn clean install
if [ $? -ne 0 ]; then
    echo "ERREUR: La compilation a echoue"
    exit 1
fi
echo ""

echo "[3/3] Demarrage de l'application..."
echo ""
echo "========================================"
echo "Service demarre sur: http://localhost:8084"
echo "Endpoint test: http://localhost:8084/api/abonnements/hello"
echo "========================================"
echo ""

mvn spring-boot:run
