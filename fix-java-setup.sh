#!/bin/bash
# Script de diagnostic et configuration Java pour le projet E-Learning
# À exécuter dans Git Bash

echo "=========================================="
echo "  Diagnostic Java - E-Learning Microservices"
echo "=========================================="
echo ""

# 1. Vérifier si java est dans le PATH
echo "1. Vérification de Java dans le PATH:"
if command -v java &>/dev/null; then
    java -version 2>&1
    JAVA_PATH=$(which java)
    echo "   Java trouvé: $JAVA_PATH"
else
    echo "   ❌ Java NON trouvé dans le PATH"
fi
echo ""

# 2. Vérifier JAVA_HOME
echo "2. Variable JAVA_HOME:"
if [[ -n "$JAVA_HOME" ]]; then
    echo "   JAVA_HOME = $JAVA_HOME"
    if [[ -f "$JAVA_HOME/bin/java" ]]; then
        echo "   ✅ JAVA_HOME/bin/java existe"
    else
        echo "   ❌ JAVA_HOME/bin/java n'existe pas"
    fi
else
    echo "   ❌ JAVA_HOME n'est pas défini"
fi
echo ""

# 3. Chercher Java sur le système (Windows)
echo "3. Recherche de Java sur le système:"
FOUND=0
POSSIBLE_BASES=(
    "/c/Program Files/Java"
    "/c/Program Files/Eclipse Adoptium"
    "/c/Program Files/Microsoft"
    "/c/Program Files/Amazon Corretto"
    "/c/Program Files/OpenJDK"
    "/c/Program Files (x86)/Java"
    "/c/Users/${USERNAME:-$USER}/AppData/Local/Programs/Java"
)

for base in "${POSSIBLE_BASES[@]}"; do
    if [[ -d "$base" ]]; then
        for dir in "$base"/*; do
            if [[ -d "$dir" && -f "$dir/bin/java" ]]; then
                echo "   ✅ Trouvé: $dir"
                FOUND=1
            fi
        done
    fi
done

# Chercher java.exe via Windows
if command -v where &>/dev/null; then
    JAVA_WIN=$(where java 2>/dev/null | head -1)
    [[ -n "$JAVA_WIN" ]] && echo "   ℹ️  Windows 'where java': $JAVA_WIN"
fi

[[ $FOUND -eq 0 ]] && echo "   Aucune installation Java trouvée automatiquement."
echo ""

# 4. Instructions
echo "=========================================="
echo "  INSTRUCTIONS POUR INSTALLER JAVA 17"
echo "=========================================="
echo ""
echo "Java n'est pas installé ou non détecté. Voici comment l'installer:"
echo ""
echo "OPTION A - Téléchargement manuel (recommandé):"
echo "  1. Allez sur: https://adoptium.net/temurin/releases/"
echo "  2. Choisissez: Version 17, OS Windows, Architecture x64"
echo "  3. Téléchargez le .msi et installez"
echo "  4. Par défaut: C:\\Program Files\\Eclipse Adoptium\\jdk-17.x.x"
echo ""
echo "OPTION B - Avec winget (Windows 11):"
echo "  winget install EclipseAdoptium.Temurin.17.JDK"
echo ""
echo "OPTION C - Avec Chocolatey:"
echo "  choco install temurin17"
echo ""
echo "APRÈS INSTALLATION, ajoutez à ~/.bashrc (Git Bash):"
echo "  export JAVA_HOME=\"/c/Program Files/Eclipse Adoptium/jdk-17.x.x\""
echo "  export PATH=\"\$JAVA_HOME/bin:\$PATH\""
echo ""
echo "  (Adaptez jdk-17.x.x au dossier réel créé)"
echo "  Puis: source ~/.bashrc"
echo ""
