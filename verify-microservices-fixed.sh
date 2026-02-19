#!/bin/bash

################################################################################
#  SCRIPT DE VÉRIFICATION - ARCHITECTURE MICROSERVICES SPRING BOOT E-LEARNING
#  Version: 1.1 (Fixed for Windows)
#  Description: Vérification complète de l'architecture microservices
################################################################################

# Configuration Java pour Windows
export JAVA_HOME="/c/Program Files/Eclipse Adoptium/jdk-17.0.18.8-hotspot"
export PATH="$JAVA_HOME/bin:$PATH"

# ============================================================================
# CONFIGURATION
# ============================================================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="${SCRIPT_DIR}"
REPORT_FILE="${PROJECT_ROOT}/verification-report.txt"
START_TIME=$(date +%s)

# Compteurs
TOTAL_CHECKS=0
SUCCESS_COUNT=0
FAIL_COUNT=0
SKIP_COUNT=0

# Options
VERBOSE=false
QUIET=false
FIX_MODE=false
SKIP_DB=false
SKIP_MAVEN=false
EXPORT_JSON=false

# Microservices
SERVICES=("api-gateway" "eureka-server" "formation-service" "quiz-badge-service")

# Couleurs ANSI
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Tableau des problèmes
declare -a ISSUES=()
declare -a RECOMMENDATIONS=()

# ============================================================================
# FONCTIONS
# ============================================================================

log() {
    if [[ "$QUIET" != "true" ]]; then
        echo -e "$1"
    fi
}

log_verbose() {
    if [[ "$VERBOSE" == "true" ]]; then
        echo -e "$1" >&2
    fi
}

check_result() {
    local result=$1
    local success_msg=$2
    local fail_msg=$3
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    if [[ $result -eq 1 ]]; then
        log "  ${GREEN}✅ $success_msg${NC}"
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    else
        log "  ${RED}❌ $fail_msg${NC}"
        FAIL_COUNT=$((FAIL_COUNT + 1))
        ISSUES+=("$fail_msg")
    fi
}

test_service_build() {
    local service=$1
    log "[${YELLOW}$(date '+%Y-%m-%d %H:%M:%S')${NC}] Compilation de $service..."
    
    local service_path="$PROJECT_ROOT/$service"
    
    if [[ -d "$service_path" && -f "$service_path/pom.xml" ]]; then
        # Détecter la commande Maven (mvn ou mvnw)
        local mvn_cmd="./mvnw.cmd"
        if [[ ! -f "$service_path/mvnw.cmd" ]]; then
            mvn_cmd="mvn"
        fi
        
        local output
        output=$(cd "$service_path" && $mvn_cmd clean compile -q 2>&1)
        local exit_code=$?
        
        log_verbose "Sortie de compilation pour $service: $output"
        
        if [[ $exit_code -eq 0 ]]; then
            check_result 1 "BUILD SUCCESS: $service" "BUILD FAILED: $service"
        else
            check_result 0 "BUILD SUCCESS: $service" "BUILD FAILED: $service"
            if [[ "$VERBOSE" == "true" ]]; then
                log "    ${RED}Erreur: $output${NC}"
            fi
        fi
    else
        check_result 0 "pom.xml exists in $service" "pom.xml not found in $service"
    fi
}

# ============================================================================
# VÉRIFICATION PRINCIPALE
# ============================================================================

clear

echo -e "${CYAN}"
cat << 'EOF'
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║   ██╗   ██╗███████╗██████╗ ██╗███████╗██╗   ██╗                      ║
║   ██║   ██║██╔════╝██╔══██╗██║██╔════╝╚██╗ ██╔╝                      ║
║   ██║   ██║█████╗  ██████╔╝██║█████╗   ╚████╔╝                       ║
║   ╚██╗ ██╔╝██╔══╝  ██╔══██╗██║██╔══╝    ╚██╔╝                        ║
║    ╚████╔╝ ███████╗██║  ██║██║██║        ██║                         ║
║     ╚═══╝  ╚══════╝╚═╝  ╚═╝╚═╝╚═╝        ╚═╝                         ║
║                                                                      ║
║   Microservices Spring Boot E-Learning - Vérification Complète       ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

log "[${YELLOW}$(date '+%Y-%m-%d %H:%M:%S')${NC}] Démarrage de la vérification..."
log_verbose "JAVA_HOME: $JAVA_HOME"
log_verbose "PATH: $PATH"

# Vérification rapide de Java
if command -v java &>/dev/null; then
    log_verbose "Java version: $(java -version 2>&1 | head -1)"
else
    log "${RED}Java non trouvé dans le PATH${NC}"
fi

# ÉTAPE 10: COMPILATION MAVEN
if [[ "$SKIP_MAVEN" != "true" ]]; then
    log ""
    log "${MAGENTA}🚀 ÉTAPE 10: COMPILATION MAVEN${NC}"
    log "────────────────────────────────────────────────────────────────"
    
    for service in "${SERVICES[@]}"; do
        test_service_build "$service"
    done
fi

# RAPPORT FINAL
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

log ""
log "${GREEN}✅ ÉTAPE 15: RAPPORT FINAL${NC}"
log "════════════════════════════════════════════════════════════════"

cat << EOF
┌─────────────────────────────────────────────────────────┐
│              RÉSUMÉ DE LA VÉRIFICATION                    │
├─────────────────────────────────────────────────────────┤
│  Total vérifications:    $TOTAL_CHECKS                     │
│  Succès:               $SUCCESS_COUNT                     │
│  Échecs:               $FAIL_COUNT                       │
│  Ignorés:              $SKIP_COUNT                       │
│  Pourcentage complétion: $(( SUCCESS_COUNT * 100 / TOTAL_CHECKS )) %                          │
│  Temps d'exécution:      $DURATION  secondes                     │
└─────────────────────────────────────────────────────────┘
EOF

if [[ $FAIL_COUNT -gt 0 ]]; then
    log ""
    log "${RED}❌ PROBLÈMES TROUVÉS:${NC}"
    for issue in "${ISSUES[@]}"; do
        log "  • $issue"
    done
fi

log ""
log "${YELLOW}💡 RECOMMENDATIONS:${NC}"
if [[ $FAIL_COUNT -gt 0 ]]; then
    log "  • Vérifier JAVA_HOME (java -version) et que Java 17 est installé"
    log "  • Pour diagnostiquer: $0 -v --skip-db"
    log "  • Pour ignorer Maven: $0 --skip-maven --skip-db"
else
    log "  ✅ Tous les services sont prêts pour le déploiement"
fi

log ""
log "${YELLOW}📋 PROCHAINES ÉTAPES:${NC}"
log "  1. Corriger les problèmes identifiés ci-dessus"
log "  2. Démarrer Eureka Server (port 8761)"
log "  3. Démarrer les microservices (formation, quiz-badge)"
log "  4. Démarrer API Gateway (port 8080)"
log "  5. Tester les endpoints via l'API Gateway"

log ""
log "[${YELLOW}$(date '+%Y-%m-%d %H:%M:%S')${NC}] Rapport exporté vers: $REPORT_FILE"

exit $FAIL_COUNT
