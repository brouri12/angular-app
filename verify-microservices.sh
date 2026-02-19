#!/bin/bash

################################################################################
#  SCRIPT DE VÉRIFICATION - ARCHITECTURE MICROSERVICES SPRING BOOT E-LEARNING
#  Version: 1.0
#  Description: Vérification complète de l'architecture microservices
#
#  USAGE: ./verify-microservices.sh [OPTIONS]
#  Windows: Exécuter avec Git Bash ou WSL (bash verify-microservices.sh)
################################################################################

# ============================================================================
# CONFIGURATION
# ============================================================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="${SCRIPT_DIR}"
REPORT_FILE="${PROJECT_ROOT}/verification-report.txt"
JSON_REPORT="${PROJECT_ROOT}/verification-report.json"
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
# ASCII ART HEADER
# ============================================================================
print_header() {
    if [[ "$QUIET" == false ]]; then
        echo -e "${CYAN}"
        echo "╔══════════════════════════════════════════════════════════════════════╗"
        echo "║                                                                      ║"
        echo "║   ██╗   ██╗███████╗██████╗ ██╗███████╗██╗   ██╗                      ║"
        echo "║   ██║   ██║██╔════╝██╔══██╗██║██╔════╝╚██╗ ██╔╝                      ║"
        echo "║   ██║   ██║█████╗  ██████╔╝██║█████╗   ╚████╔╝                       ║"
        echo "║   ╚██╗ ██╔╝██╔══╝  ██╔══██╗██║██╔══╝    ╚██╔╝                        ║"
        echo "║    ╚████╔╝ ███████╗██║  ██║██║██║        ██║                         ║"
        echo "║     ╚═══╝  ╚══════╝╚═╝  ╚═╝╚═╝╚═╝        ╚═╝                         ║"
        echo "║                                                                      ║"
        echo "║   Microservices Spring Boot E-Learning - Vérification Complète       ║"
        echo "║                                                                      ║"
        echo "╚══════════════════════════════════════════════════════════════════════╝"
        echo -e "${NC}"
        echo -e "${BLUE}[$(timestamp)]${NC} Démarrage de la vérification..."
        echo ""
    fi
}

timestamp() {
    date '+%Y-%m-%d %H:%M:%S'
}

log() {
    if [[ "$QUIET" == false ]]; then
        echo -e "${BLUE}[$(timestamp)]${NC} $1"
    fi
}

log_verbose() {
    if [[ "$VERBOSE" == true ]]; then
        echo -e "${MAGENTA}[VERBOSE]${NC} $1"
    fi
}

# ============================================================================
# BARRE DE PROGRESSION
# ============================================================================
progress_bar() {
    local current=$1
    local total=$2
    local width=50
    local percentage=$((current * 100 / total))
    local filled=$((width * current / total))
    local empty=$((width - filled))
    
    if [[ "$QUIET" == false ]]; then
        printf "\r  ["
        printf "%${filled}s" | tr ' ' '█'
        printf "%${empty}s" | tr ' ' '░'
        printf "] ${percentage}%% (${current}/${total})"
    fi
}

# ============================================================================
# FONCTIONS DE VÉRIFICATION
# ============================================================================

check_result() {
    local success=$1
    local message=$2
    local fix_msg=$3
    
    ((TOTAL_CHECKS++))
    
    if [[ $success -eq 1 ]]; then
        ((SUCCESS_COUNT++))
        if [[ "$QUIET" == false ]]; then
            echo -e "  ${GREEN}✅ $message${NC}"
        fi
        return 0
    else
        ((FAIL_COUNT++))
        ISSUES+=("$message")
        if [[ "$QUIET" == false ]]; then
            echo -e "  ${RED}❌ $message${NC}"
        fi
        if [[ "$FIX_MODE" == true && -n "$fix_msg" ]]; then
            log_verbose "Fix: $fix_msg"
        fi
        return 1
    fi
}

check_folder() {
    local folder=$1
    local required=$2
    
    if [[ -d "$PROJECT_ROOT/$folder" ]]; then
        check_result 1 "Dossier $folder existe"
    else
        check_result 0 "Dossier $folder manquant"
        if [[ "$FIX_MODE" == true && "$required" == "true" ]]; then
            log_verbose "Création du dossier $folder..."
            mkdir -p "$PROJECT_ROOT/$folder" 2>/dev/null && log "Dossier $folder créé"
        fi
    fi
}

check_file() {
    local file=$1
    local service=$2
    
    local path="$PROJECT_ROOT/$service/$file"
    if [[ -f "$path" ]]; then
        check_result 1 "Fichier $file présent dans $service"
        return 0
    else
        check_result 0 "Fichier $file manquant dans $service"
        return 1
    fi
}

check_java_annotations() {
    local file_path=$1
    shift
    local annotations=("$@")
    
    file_path="${file_path//\\/\/}"
    [[ ! -f "$file_path" ]] && return 1
    
    # Lecture via subshell et redirection (plus fiable sous Windows)
    local content
    content=$(while IFS= read -r line || [[ -n "$line" ]]; do echo "$line"; done < "$file_path" 2>/dev/null)
    [[ -z "$content" ]] && content=$(cat "$file_path" 2>/dev/null)
    
    [[ -z "$content" ]] && return 1
    
    local all_found=1
    for ann in "${annotations[@]}"; do
        [[ "$content" = *"$ann"* ]] || { all_found=0; break; }
    done
    
    return $all_found
}

# ============================================================================
# ÉTAPE 1: STRUCTURE DES DOSSIERS
# ============================================================================
step1_structure() {
    echo ""
    echo -e "${BOLD}${CYAN}📁 ÉTAPE 1: STRUCTURE DES DOSSIERS${NC}"
    echo "────────────────────────────────────────────────────────────────"
    
    local step_checks=0
    local step_total=0
    
    # Vérifier les 4 microservices
    for service in "${SERVICES[@]}"; do
        ((step_total++))
        check_folder "$service" "true"
        ((step_checks++))
    done
    
    # Structure Maven standard pour chaque service
    for service in "${SERVICES[@]}"; do
        local base="$PROJECT_ROOT/$service"
        local maven_dirs=("src/main/java" "src/main/resources" "src/test/java")
        
        for dir in "${maven_dirs[@]}"; do
            ((step_total++))
            if [[ -d "$base/$dir" ]]; then
                check_result 1 "Structure Maven $dir dans $service"
            else
                if [[ "$FIX_MODE" == true ]]; then
                    mkdir -p "$base/$dir" 2>/dev/null
                    if [[ -d "$base/$dir" ]]; then
                        check_result 1 "Structure Maven $dir créée dans $service (--fix)"
                    else
                        check_result 0 "Structure Maven $dir manquante dans $service"
                    fi
                else
                    check_result 0 "Structure Maven $dir manquante dans $service"
                fi
            fi
        done
        
        ((step_total++))
        if [[ -f "$base/pom.xml" ]]; then
            check_result 1 "pom.xml dans $service"
        else
            check_result 0 "pom.xml manquant dans $service"
        fi
    done
    
    # Packages dans formation-service (model ou entity acceptés)
    local fs_packages=("repository" "service" "controller" "dto")
    local fs_model=$(find "$PROJECT_ROOT/formation-service" -type d \( -name "model" -o -name "entity" \) 2>/dev/null | head -1)
    ((step_total++))
    [[ -n "$fs_model" ]] && check_result 1 "Package model/entity dans formation-service" || check_result 0 "Package model/entity manquant dans formation-service"
    for pkg in "${fs_packages[@]}"; do
        ((step_total++))
        local pkg_path=$(find "$PROJECT_ROOT/formation-service" -type d -name "$pkg" 2>/dev/null | head -1)
        [[ -n "$pkg_path" ]] && check_result 1 "Package $pkg/ dans formation-service" || check_result 0 "Package $pkg/ manquant dans formation-service"
    done
    
    # Packages dans quiz-badge-service (model ou entity acceptés)
    local qb_model=$(find "$PROJECT_ROOT/quiz-badge-service" -type d \( -name "model" -o -name "entity" \) 2>/dev/null | head -1)
    ((step_total++))
    [[ -n "$qb_model" ]] && check_result 1 "Package model/entity dans quiz-badge-service" || check_result 0 "Package model/entity manquant dans quiz-badge-service"
    for pkg in "${fs_packages[@]}"; do
        ((step_total++))
        local pkg_path=$(find "$PROJECT_ROOT/quiz-badge-service" -type d -name "$pkg" 2>/dev/null | head -1)
        [[ -n "$pkg_path" ]] && check_result 1 "Package $pkg/ dans quiz-badge-service" || check_result 0 "Package $pkg/ manquant dans quiz-badge-service"
    done
}

# ============================================================================
# ÉTAPE 2: FICHIERS ESSENTIELS
# ============================================================================
step2_essential_files() {
    echo ""
    echo -e "${BOLD}${CYAN}📄 ÉTAPE 2: FICHIERS ESSENTIELS${NC}"
    echo "────────────────────────────────────────────────────────────────"
    
    for service in "${SERVICES[@]}"; do
        echo -e "  ${BOLD}🔍 Vérification $service:${NC}"
        
        # Application.java - chercher le nom exact
        local app_java=$(find "$PROJECT_ROOT/$service" -name "*Application.java" -type f 2>/dev/null | head -1)
        if [[ -n "$app_java" ]]; then
            check_result 1 "Application.java dans $service"
        else
            check_result 0 "Application.java manquant dans $service"
        fi
        
        # application.yml ou application.properties
        if [[ -f "$PROJECT_ROOT/$service/src/main/resources/application.yml" ]] || \
           [[ -f "$PROJECT_ROOT/$service/src/main/resources/application.properties" ]]; then
            check_result 1 "application.yml/properties dans $service"
        else
            check_result 0 "application.yml/properties manquant dans $service"
        fi
        
        # pom.xml
        if [[ -f "$PROJECT_ROOT/$service/pom.xml" ]]; then
            check_result 1 "pom.xml dans $service"
        else
            check_result 0 "pom.xml manquant dans $service"
        fi
        
        # Dockerfile (optionnel)
        if [[ -f "$PROJECT_ROOT/$service/Dockerfile" ]]; then
            check_result 1 "Dockerfile présent dans $service (optionnel)"
        else
            ((TOTAL_CHECKS++))
            ((SKIP_COUNT++))
            if [[ "$QUIET" == false ]]; then
                echo -e "  ${YELLOW}⚠️  Dockerfile optionnel - non trouvé dans $service${NC}"
            fi
        fi
    done
}

# ============================================================================
# ÉTAPE 3: ENTITÉS/MODELS
# ============================================================================
step3_entities() {
    echo ""
    echo -e "${BOLD}${CYAN}📦 ÉTAPE 3: ENTITÉS/MODELS${NC}"
    echo "────────────────────────────────────────────────────────────────"
    
    # Formation-service - chemins explicites (fiables sous Windows/Git Bash)
    local fs_base="$PROJECT_ROOT/formation-service/src/main/java/com/elearning/formation/entity"
    for entity in Course CourseEnrollment; do
        local entity_file="$fs_base/${entity}.java"
        if [[ -f "$entity_file" ]]; then
            if grep -q "@Entity" "$entity_file" 2>/dev/null && grep -q "@Id" "$entity_file" 2>/dev/null; then
                check_result 1 "Entité $entity.java avec annotations JPA (@Entity, @Id)"
            else
                check_result 0 "Entité $entity.java - annotations JPA incomplètes"
            fi
        else
            check_result 0 "Entité $entity.java manquante dans formation-service"
        fi
    done
    
    # Quiz-badge-service
    local qb_base="$PROJECT_ROOT/quiz-badge-service/src/main/java/com/elearning/quizbadge/entity"
    for entity in Question Response Badge; do
        local entity_file="$qb_base/${entity}.java"
        if [[ -f "$entity_file" ]]; then
            if grep -q "@Entity" "$entity_file" 2>/dev/null && grep -q "@Id" "$entity_file" 2>/dev/null; then
                check_result 1 "Entité $entity.java avec annotations JPA (@Entity, @Id)"
            else
                check_result 0 "Entité $entity.java - annotations JPA incomplètes"
            fi
        else
            check_result 0 "Entité $entity.java manquante dans quiz-badge-service"
        fi
    done
}

# ============================================================================
# ÉTAPE 4: REPOSITORIES
# ============================================================================
step4_repositories() {
    echo ""
    echo -e "${BOLD}${CYAN}📊 ÉTAPE 4: REPOSITORIES${NC}"
    echo "────────────────────────────────────────────────────────────────"
    
    declare -A repos
    repos["CourseRepository"]="formation-service"
    repos["CourseEnrollmentRepository|EnrollmentRepository"]="formation-service"
    repos["QuestionRepository"]="quiz-badge-service"
    repos["ResponseRepository"]="quiz-badge-service"
    repos["BadgeRepository"]="quiz-badge-service"
    
    for repo_key in "${!repos[@]}"; do
        local service=${repos[$repo_key]}
        local repo_file=""
        # Gérer les alternatives (ex: CourseEnrollmentRepository|EnrollmentRepository)
        IFS='|' read -ra repo_names <<< "$repo_key"
        for r in "${repo_names[@]}"; do
            repo_file=$(find "$PROJECT_ROOT/$service" -name "${r}.java" -type f 2>/dev/null | head -1)
            [[ -n "$repo_file" ]] && break
        done
        
        if [[ -n "$repo_file" ]]; then
            if grep -q "extends JpaRepository" "$repo_file" 2>/dev/null; then
                check_result 1 "Repository ${repo_names[0]} extends JpaRepository"
            else
                check_result 0 "Repository ${repo_names[0]} - n'extends pas JpaRepository"
            fi
        else
            check_result 0 "Repository ${repo_names[0]}.java manquant dans $service"
        fi
    done
}

# ============================================================================
# ÉTAPE 5: SERVICES
# ============================================================================
step5_services() {
    echo ""
    echo -e "${BOLD}${CYAN}🔧 ÉTAPE 5: SERVICES${NC}"
    echo "────────────────────────────────────────────────────────────────"
    
    declare -A svcs
    svcs["CourseService"]="formation-service"
    svcs["EnrollmentService"]="formation-service"
    svcs["QuestionService"]="quiz-badge-service"
    svcs["ResponseService"]="quiz-badge-service"
    svcs["BadgeService"]="quiz-badge-service"
    
    for svc in "${!svcs[@]}"; do
        local service=${svcs[$svc]}
        local svc_file=$(find "$PROJECT_ROOT/$service" -name "${svc}.java" -type f 2>/dev/null | head -1)
        
        if [[ -n "$svc_file" ]]; then
            local has_service=false
            local has_slf4j=false
            local has_transactional=false
            
            grep -q "@Service" "$svc_file" 2>/dev/null && has_service=true
            grep -q "@Slf4j\|lombok" "$svc_file" 2>/dev/null && has_slf4j=true
            grep -q "@Transactional" "$svc_file" 2>/dev/null && has_transactional=true
            
            if $has_service; then
                check_result 1 "Service $svc avec @Service"
            else
                check_result 0 "Service $svc - @Service manquant"
            fi
        else
            check_result 0 "Service $svc.java manquant dans $service"
        fi
    done
}

# ============================================================================
# ÉTAPE 6: CONTROLLERS
# ============================================================================
step6_controllers() {
    echo ""
    echo -e "${BOLD}${CYAN}🌐 ÉTAPE 6: CONTROLLERS${NC}"
    echo "────────────────────────────────────────────────────────────────"
    
    declare -A ctrls
    ctrls["CourseController"]="formation-service"
    ctrls["EnrollmentController"]="formation-service"
    ctrls["QuestionController"]="quiz-badge-service"
    ctrls["ResponseController"]="quiz-badge-service"
    ctrls["BadgeController"]="quiz-badge-service"
    
    for ctrl in "${!ctrls[@]}"; do
        local service=${ctrls[$ctrl]}
        local ctrl_file=$(find "$PROJECT_ROOT/$service" -name "${ctrl}.java" -type f 2>/dev/null | head -1)
        
        if [[ -n "$ctrl_file" ]]; then
            local has_rest=false
            local has_mapping=false
            local has_cors=false
            
            grep -q "@RestController" "$ctrl_file" 2>/dev/null && has_rest=true
            grep -q "@RequestMapping\|@GetMapping\|@PostMapping\|@PutMapping\|@DeleteMapping" "$ctrl_file" 2>/dev/null && has_mapping=true
            grep -q "@CrossOrigin" "$ctrl_file" 2>/dev/null && has_cors=true
            
            if $has_rest && $has_mapping; then
                check_result 1 "Controller $ctrl avec @RestController et mappings"
            else
                check_result 0 "Controller $ctrl - annotations manquantes"
            fi
        else
            check_result 0 "Controller $ctrl.java manquant dans $service"
        fi
    done
}

# ============================================================================
# ÉTAPE 7: CONFIGURATION application.yml
# ============================================================================
step7_configuration() {
    echo ""
    echo -e "${BOLD}${CYAN}⚙️  ÉTAPE 7: CONFIGURATION${NC}"
    echo "────────────────────────────────────────────────────────────────"
    
    for service in "formation-service" "quiz-badge-service" "api-gateway"; do
        local config_file=""
        [[ -f "$PROJECT_ROOT/$service/src/main/resources/application.yml" ]] && config_file="$PROJECT_ROOT/$service/src/main/resources/application.yml"
        [[ -z "$config_file" && -f "$PROJECT_ROOT/$service/src/main/resources/application.properties" ]] && config_file="$PROJECT_ROOT/$service/src/main/resources/application.properties"
        
        if [[ -n "$config_file" ]]; then
            local content
            content=$(cat "$config_file" 2>/dev/null)
            
            echo "$content" | grep -qE "server:\s*$|server\.port|port:" && check_result 1 "server.port dans $service" || check_result 0 "server.port manquant dans $service"
            echo "$content" | grep -qE "spring\.application\.name|application:\s*$|name:" && check_result 1 "spring.application.name dans $service" || check_result 0 "spring.application.name manquant dans $service"
            
            if [[ "$service" != "api-gateway" ]]; then
                echo "$content" | grep -qE "datasource|spring\.datasource|jdbc:" && check_result 1 "spring.datasource dans $service" || check_result 0 "spring.datasource manquant dans $service"
                echo "$content" | grep -qE "eureka|eureka\.client|service-url" && check_result 1 "eureka.client dans $service" || check_result 0 "eureka.client manquant dans $service"
            fi
        else
            check_result 0 "Fichier configuration manquant pour $service"
        fi
    done
}

# ============================================================================
# ÉTAPE 8: DÉPENDANCES POM.XML
# ============================================================================
step8_pom_dependencies() {
    echo ""
    echo -e "${BOLD}${CYAN}📦 ÉTAPE 8: DÉPENDANCES POM.XML${NC}"
    echo "────────────────────────────────────────────────────────────────"
    
    # formation-service et quiz-badge-service: web, jpa, mysql, lombok, eureka
    for service in "formation-service" "quiz-badge-service"; do
        local pom="$PROJECT_ROOT/$service/pom.xml"
        if [[ -f "$pom" ]]; then
            local content
            content=$(cat "$pom" 2>/dev/null)
            local svc_deps=("spring-boot-starter-web" "spring-boot-starter-data-jpa" "mysql-connector-j" "lombok" "eureka-client")
            for dep in "${svc_deps[@]}"; do
                echo "$content" | grep -q "$dep" && check_result 1 "Dépendance $dep dans $service" || check_result 0 "Dépendance $dep manquante dans $service"
            done
        fi
    done
    
    # api-gateway: gateway (pas web), eureka-client (pas jpa/mysql - c'est un gateway)
    local gateway_pom="$PROJECT_ROOT/api-gateway/pom.xml"
    if [[ -f "$gateway_pom" ]]; then
        local content
        content=$(cat "$gateway_pom" 2>/dev/null)
        echo "$content" | grep -qE "spring-cloud-starter-gateway|spring-boot-starter-web" && check_result 1 "Dépendance web/gateway dans api-gateway" || check_result 0 "Dépendance web/gateway manquante dans api-gateway"
        echo "$content" | grep -q "eureka-client" && check_result 1 "Dépendance eureka-client dans api-gateway" || check_result 0 "Dépendance eureka-client manquante dans api-gateway"
    fi
    
    # Eureka-server a des deps différentes (pas eureka-client)
    local eureka_pom="$PROJECT_ROOT/eureka-server/pom.xml"
    if [[ -f "$eureka_pom" ]]; then
        grep -q "eureka-server" "$eureka_pom" 2>/dev/null && check_result 1 "eureka-server dans eureka-server pom" || check_result 0 "eureka-server dependency manquante"
    fi
}

# ============================================================================
# ÉTAPE 9: BASE DE DONNÉES
# ============================================================================
step9_database() {
    if [[ "$SKIP_DB" == true ]]; then
        echo ""
        echo -e "${YELLOW}⚠️  ÉTAPE 9: BASE DE DONNÉES (ignorée --skip-db)${NC}"
        return
    fi
    
    echo ""
    echo -e "${BOLD}${CYAN}🗄️  ÉTAPE 9: BASE DE DONNÉES${NC}"
    echo "────────────────────────────────────────────────────────────────"
    
    # MySQL installé
    if command -v mysql &>/dev/null; then
        local mysql_version
        mysql_version=$(mysql --version 2>/dev/null)
        check_result 1 "MySQL installé: $mysql_version"
    else
        check_result 0 "MySQL non installé (mysql --version échoue)"
        RECOMMENDATIONS+=("Installer MySQL pour les tests de base de données")
    fi
    
    # Connexion formation_db
    if command -v mysql &>/dev/null; then
        if mysql -u root -e "USE formation_db;" 2>/dev/null; then
            check_result 1 "Connexion à formation_db réussie"
            local tables
            tables=$(mysql -u root -N -e "SHOW TABLES FROM formation_db;" 2>/dev/null)
            if [[ -n "$tables" ]]; then
                check_result 1 "Tables dans formation_db: $(echo $tables | tr '\n' ', ')"
            fi
        else
            check_result 0 "Connexion à formation_db échouée (base peut ne pas exister)"
        fi
        
        # Connexion quiz_badge_db
        if mysql -u root -e "USE quiz_badge_db;" 2>/dev/null; then
            check_result 1 "Connexion à quiz_badge_db réussie"
            tables=$(mysql -u root -N -e "SHOW TABLES FROM quiz_badge_db;" 2>/dev/null)
            if [[ -n "$tables" ]]; then
                check_result 1 "Tables dans quiz_badge_db: $(echo $tables | tr '\n' ', ')"
            fi
        else
            check_result 0 "Connexion à quiz_badge_db échouée"
        fi
    fi
}

# ============================================================================
# ÉTAPE 10: COMPILATION MAVEN
# ============================================================================
step10_maven_compile() {
    if [[ "$SKIP_MAVEN" == true ]]; then
        echo ""
        echo -e "${YELLOW}⚠️  ÉTAPE 10: COMPILATION MAVEN (ignorée --skip-maven)${NC}"
        return
    fi
    
    echo ""
    echo -e "${BOLD}${CYAN}🚀 ÉTAPE 10: COMPILATION MAVEN${NC}"
    echo "────────────────────────────────────────────────────────────────"
    
    # Vérifier Java (requis pour Maven)
    if ! command -v java &>/dev/null && [[ -z "${JAVA_HOME:-}" ]]; then
        check_result 0 "Java non trouvé - JAVA_HOME non défini"
        RECOMMENDATIONS+=("Exécuter: bash fix-java-setup.sh pour diagnostiquer Java")
        RECOMMENDATIONS+=("Configurer JAVA_HOME dans ~/.bashrc (voir fix-java-setup.sh)")
        return
    fi
    
    # Détecter la commande Maven (mvn ou mvnw)
    local MVN_CMD="mvn"
    if command -v mvn &>/dev/null; then
        MVN_CMD="mvn"
    elif [[ -f "$PROJECT_ROOT/formation-service/mvnw" ]]; then
        MVN_CMD="./mvnw"
    elif [[ -f "$PROJECT_ROOT/formation-service/mvnw.cmd" ]]; then
        MVN_CMD="mvnw.cmd"
    else
        check_result 0 "Maven non trouvé - exécutez 'mvn wrapper:wrapper' dans un service"
        RECOMMENDATIONS+=("Installer Maven et l'ajouter au PATH, ou générer le wrapper")
        return
    fi
    
    local compile_errors=0
    
    for service in "${SERVICES[@]}"; do
        local service_path="$PROJECT_ROOT/$service"
        if [[ -d "$service_path" && -f "$service_path/pom.xml" ]]; then
            log "Compilation de $service..."
            local mvn_cmd="$MVN_CMD"
            [[ -f "$service_path/mvnw" ]] && mvn_cmd="./mvnw"
            local output
            output=$(cd "$service_path" && $mvn_cmd clean compile -q 2>&1)
            local exit_code=$?
            
            if [[ $exit_code -eq 0 ]]; then
                check_result 1 "BUILD SUCCESS: $service"
            else
                ((compile_errors++))
                check_result 0 "BUILD FAILED: $service"
                if [[ "$VERBOSE" == true ]]; then
                    echo -e "  ${YELLOW}--- Détails ($service) ---${NC}"
                    echo "$output" | tail -25
                    echo -e "  ${YELLOW}--- Fin ---${NC}"
                fi
            fi
        else
            ((TOTAL_CHECKS++))
            ((FAIL_COUNT++))
            echo -e "  ${RED}❌ $service - pom.xml non trouvé${NC}"
        fi
    done
    
    if [[ $compile_errors -gt 0 ]]; then
        RECOMMENDATIONS+=("Vérifier JAVA_HOME (java -version) et que Java 17 est installé")
        RECOMMENDATIONS+=("Pour diagnostiquer: bash verify-microservices.sh -v --skip-db")
        RECOMMENDATIONS+=("Pour ignorer Maven: bash verify-microservices.sh --skip-maven --skip-db")
    fi
}

# ============================================================================
# ÉTAPE 11: TESTS UNITAIRES
# ============================================================================
step11_unit_tests() {
    if [[ "$SKIP_MAVEN" == true ]]; then
        echo ""
        echo -e "${YELLOW}⚠️  ÉTAPE 11: TESTS UNITAIRES (ignorée --skip-maven)${NC}"
        return
    fi
    
    echo ""
    echo -e "${BOLD}${CYAN}🔥 ÉTAPE 11: TESTS UNITAIRES${NC}"
    echo "────────────────────────────────────────────────────────────────"
    
    for service in "${SERVICES[@]}"; do
        local service_path="$PROJECT_ROOT/$service"
        if [[ -d "$service_path" && -f "$service_path/pom.xml" ]]; then
            log "Exécution des tests pour $service..."
            local mvn_cmd="mvn"
            if command -v mvn &>/dev/null; then mvn_cmd="mvn"
            elif [[ -f "$service_path/mvnw" ]]; then mvn_cmd="./mvnw"
            fi
            local output
            output=$(cd "$service_path" && $mvn_cmd test -q 2>&1)
            local exit_code=$?
            
            # Parser les résultats (compatible GNU grep et sed)
            local tests_run=$(echo "$output" | grep -oE "Tests run: [0-9]+" | tail -1 | grep -oE "[0-9]+")
            local failures=$(echo "$output" | grep -oE "Failures: [0-9]+" | tail -1 | grep -oE "[0-9]+")
            local errors=$(echo "$output" | grep -oE "Errors: [0-9]+" | tail -1 | grep -oE "[0-9]+")
            
            if [[ -n "$tests_run" ]]; then
                if [[ $exit_code -eq 0 ]]; then
                    check_result 1 "Tests $service: $tests_run passés"
                else
                    check_result 0 "Tests $service: $failures échecs, $errors erreurs"
                fi
            else
                ((TOTAL_CHECKS++))
                if [[ $exit_code -eq 0 ]]; then
                    ((SUCCESS_COUNT++))
                    echo -e "  ${GREEN}✅ Tests $service: OK (aucun test ou tous passés)${NC}"
                else
                    ((FAIL_COUNT++))
                    echo -e "  ${RED}❌ Tests $service: ÉCHEC${NC}"
                fi
            fi
        fi
    done
}

# ============================================================================
# ÉTAPE 12: DOCKER
# ============================================================================
step12_docker() {
    echo ""
    echo -e "${BOLD}${CYAN}🐳 ÉTAPE 12: DOCKER${NC}"
    echo "────────────────────────────────────────────────────────────────"
    
    if [[ -f "$PROJECT_ROOT/docker-compose.yml" ]]; then
        check_result 1 "docker-compose.yml présent"
        
        # Lister les services
        if command -v docker-compose &>/dev/null || command -v docker &>/dev/null; then
            local services
            services=$(grep -E "^\s+[a-zA-Z0-9_-]+:" "$PROJECT_ROOT/docker-compose.yml" 2>/dev/null | sed 's/://g' | tr -d ' ')
            if [[ -n "$services" ]]; then
                check_result 1 "Services Docker: $services"
            fi
        fi
        
        grep -q "networks:" "$PROJECT_ROOT/docker-compose.yml" 2>/dev/null && check_result 1 "Networks configurés" || ((TOTAL_CHECKS++)) && ((SKIP_COUNT++))
        grep -q "volumes:" "$PROJECT_ROOT/docker-compose.yml" 2>/dev/null && check_result 1 "Volumes configurés" || ((TOTAL_CHECKS++)) && ((SKIP_COUNT++))
    else
        check_result 0 "docker-compose.yml non trouvé"
        ((TOTAL_CHECKS++))
        ((SKIP_COUNT++))
        echo -e "  ${YELLOW}⚠️  Docker optionnel - fichiers non présents${NC}"
    fi
    
    local dockerfile_count=0
    for service in "${SERVICES[@]}"; do
        [[ -f "$PROJECT_ROOT/$service/Dockerfile" ]] && ((dockerfile_count++))
    done
    check_result $([[ $dockerfile_count -gt 0 ]] && echo 1 || echo 0) "Dockerfiles trouvés: $dockerfile_count/${#SERVICES[@]}"
}

# ============================================================================
# ÉTAPE 13: DÉMARRAGE DES SERVICES (simulation)
# ============================================================================
step13_startup_order() {
    echo ""
    echo -e "${BOLD}${CYAN}🌐 ÉTAPE 13: DISPONIBILITÉ DES PORTS${NC}"
    echo "────────────────────────────────────────────────────────────────"
    
    local ports=(8761 8080 8081 8082)
    local port_names=("eureka-server" "api-gateway" "formation-service" "quiz-badge-service")
    
    for i in "${!ports[@]}"; do
        local port=${ports[$i]}
        local name=${port_names[$i]}
        
        if command -v netstat &>/dev/null; then
            if netstat -an 2>/dev/null | grep -qE "\.${port}[^0-9]|:${port}[^0-9]|:${port}\s|:${port}$"; then
                check_result 0 "Port $port ($name) DÉJÀ UTILISÉ"
            else
                check_result 1 "Port $port ($name) disponible"
            fi
        elif command -v ss &>/dev/null; then
            if ss -tuln 2>/dev/null | grep -qE ":${port}[^0-9]|:${port}\s|:${port}$"; then
                check_result 0 "Port $port ($name) DÉJÀ UTILISÉ"
            else
                check_result 1 "Port $port ($name) disponible"
            fi
        else
            check_result 1 "Port $port ($name) - impossible de vérifier (netstat/ss absent)"
        fi
    done
    
    log "Ordre de démarrage recommandé: eureka-server → formation-service → quiz-badge-service → api-gateway"
}

# ============================================================================
# ÉTAPE 14: ENDPOINTS API
# ============================================================================
step14_endpoints() {
    echo ""
    echo -e "${BOLD}${CYAN}📡 ÉTAPE 14: ENDPOINTS API${NC}"
    echo "────────────────────────────────────────────────────────────────"
    
    local endpoints_found=0
    
    for service in "formation-service" "quiz-badge-service"; do
        local controllers
        controllers=$(find "$PROJECT_ROOT/$service" -name "*Controller.java" -type f 2>/dev/null)
        
        while IFS= read -r ctrl_file; do
            [[ -z "$ctrl_file" ]] && continue
            
            local base_path=""
            local class_content
            class_content=$(cat "$ctrl_file" 2>/dev/null)
            
            # Extraire @RequestMapping (compatible)
            base_path=$(echo "$class_content" | grep "@RequestMapping" | head -1 | sed -n 's/.*["'\'']\([^"'\'']*\)["'\''].*/\1/p')
            [[ -z "$base_path" ]] && base_path="/"
            
            # Extraire les mappings
            while IFS= read -r line; do
                local method=""
                local path=""
                echo "$line" | grep -q "@GetMapping" && method="GET"
                echo "$line" | grep -q "@PostMapping" && method="POST"
                echo "$line" | grep -q "@PutMapping" && method="PUT"
                echo "$line" | grep -q "@DeleteMapping" && method="DELETE"
                
                if [[ -n "$method" ]]; then
                    path=$(echo "$line" | sed -n 's/.*["'\'']\([^"'\'']*\)["'\''].*/\1/p')
                    [[ -z "$path" ]] && path="/"
                    local full_path="${base_path%/}/${path#/}"
                    full_path=$(echo "$full_path" | sed 's|//|/|g')
                    if [[ "$QUIET" == false ]]; then
                        echo -e "  ${GREEN}  $method${NC} $full_path ${CYAN}($(basename "$ctrl_file" .java))${NC}"
                    fi
                    ((endpoints_found++))
                fi
            done < <(echo "$class_content" | grep -E "@(Get|Post|Put|Delete)Mapping")
        done <<< "$controllers"
    done
    
    check_result $([[ $endpoints_found -gt 0 ]] && echo 1 || echo 0) "Endpoints REST trouvés: $endpoints_found"
}

# ============================================================================
# ÉTAPE 15: RAPPORT FINAL
# ============================================================================
step15_final_report() {
    local end_time=$(date +%s)
    local duration=$((end_time - START_TIME))
    
    echo ""
    echo -e "${BOLD}${CYAN}✅ ÉTAPE 15: RAPPORT FINAL${NC}"
    echo "════════════════════════════════════════════════════════════════"
    
    local total=$((SUCCESS_COUNT + FAIL_COUNT + SKIP_COUNT))
    [[ $total -eq 0 ]] && total=1
    local completion=$((SUCCESS_COUNT * 100 / total))
    
    echo ""
    echo -e "${BOLD}┌─────────────────────────────────────────────────────────┐${NC}"
    echo -e "${BOLD}│${NC}              ${BOLD}RÉSUMÉ DE LA VÉRIFICATION${NC}                    ${BOLD}│${NC}"
    echo -e "${BOLD}├─────────────────────────────────────────────────────────┤${NC}"
    printf "${BOLD}│${NC}  Total vérifications:    %-30s ${BOLD}│${NC}\n" "$total"
    printf "${BOLD}│${NC}  ${GREEN}Succès:${NC}               %-30s ${BOLD}│${NC}\n" "$SUCCESS_COUNT"
    printf "${BOLD}│${NC}  ${RED}Échecs:${NC}               %-30s ${BOLD}│${NC}\n" "$FAIL_COUNT"
    printf "${BOLD}│${NC}  ${YELLOW}Ignorés:${NC}              %-30s ${BOLD}│${NC}\n" "$SKIP_COUNT"
    printf "${BOLD}│${NC}  Pourcentage complétion: %-3s%%                          ${BOLD}│${NC}\n" "$completion"
    printf "${BOLD}│${NC}  Temps d'exécution:      %-3s secondes                     ${BOLD}│${NC}\n" "$duration"
    echo -e "${BOLD}└─────────────────────────────────────────────────────────┘${NC}"
    echo ""
    
    if [[ ${#ISSUES[@]} -gt 0 ]]; then
        echo -e "${BOLD}${RED}❌ PROBLÈMES TROUVÉS:${NC}"
        for issue in "${ISSUES[@]}"; do
            echo -e "  ${RED}•${NC} $issue"
        done
        echo ""
    fi
    
    if [[ ${#RECOMMENDATIONS[@]} -gt 0 ]]; then
        echo -e "${BOLD}${YELLOW}💡 RECOMMENDATIONS:${NC}"
        for rec in "${RECOMMENDATIONS[@]}"; do
            echo -e "  ${YELLOW}•${NC} $rec"
        done
        echo ""
    fi
    
    echo -e "${BOLD}📋 PROCHAINES ÉTAPES:${NC}"
    echo -e "  1. Corriger les problèmes identifiés ci-dessus"
    echo -e "  2. Démarrer Eureka Server (port 8761)"
    echo -e "  3. Démarrer les microservices (formation, quiz-badge)"
    echo -e "  4. Démarrer API Gateway (port 8080)"
    echo -e "  5. Tester les endpoints via l'API Gateway"
    echo ""
}

# ============================================================================
# GÉNÉRATION DU RAPPORT
# ============================================================================
generate_report() {
    local end_time=$(date +%s)
    local duration=$((end_time - START_TIME))
    local total=$((SUCCESS_COUNT + FAIL_COUNT + SKIP_COUNT))
    [[ $total -eq 0 ]] && total=1
    local completion=$((SUCCESS_COUNT * 100 / total))
    
    {
        echo "═══════════════════════════════════════════════════════════════"
        echo "  RAPPORT DE VÉRIFICATION - MICROSERVICES E-LEARNING"
        echo "  Généré le: $(timestamp)"
        echo "═══════════════════════════════════════════════════════════════"
        echo ""
        echo "RÉSUMÉ:"
        echo "  - Total vérifications: $total"
        echo "  - Succès: $SUCCESS_COUNT"
        echo "  - Échecs: $FAIL_COUNT"
        echo "  - Ignorés: $SKIP_COUNT"
        echo "  - Pourcentage: ${completion}%"
        echo "  - Durée: ${duration}s"
        echo ""
        echo "PROBLÈMES:"
        for issue in "${ISSUES[@]}"; do
            echo "  - $issue"
        done
        echo ""
        echo "RECOMMENDATIONS:"
        for rec in "${RECOMMENDATIONS[@]}"; do
            echo "  - $rec"
        done
    } > "$REPORT_FILE"
    
    log "Rapport exporté vers: $REPORT_FILE"
}

generate_json_report() {
    local end_time=$(date +%s)
    local duration=$((end_time - START_TIME))
    local total=$((SUCCESS_COUNT + FAIL_COUNT + SKIP_COUNT))
    [[ $total -eq 0 ]] && total=1
    local completion=$((SUCCESS_COUNT * 100 / total))
    
    local issues_json="["
    for i in "${!ISSUES[@]}"; do
        [[ $i -gt 0 ]] && issues_json+=","
        issues_json+="\"${ISSUES[$i]//\"/\\\"}\""
    done
    issues_json+="]"
    
    local recs_json="["
    for i in "${!RECOMMENDATIONS[@]}"; do
        [[ $i -gt 0 ]] && recs_json+=","
        recs_json+="\"${RECOMMENDATIONS[$i]//\"/\\\"}\""
    done
    recs_json+="]"
    
    cat > "$JSON_REPORT" << EOF
{
  "timestamp": "$(timestamp)",
  "duration_seconds": $duration,
  "summary": {
    "total_checks": $total,
    "success": $SUCCESS_COUNT,
    "failures": $FAIL_COUNT,
    "skipped": $SKIP_COUNT,
    "completion_percentage": $completion
  },
  "issues": $issues_json,
  "recommendations": $recs_json
}
EOF
    
    log "Rapport JSON exporté vers: $JSON_REPORT"
}

# ============================================================================
# PARSING DES ARGUMENTS
# ============================================================================
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            -q|--quiet)
                QUIET=true
                shift
                ;;
            --fix)
                FIX_MODE=true
                shift
                ;;
            --skip-db)
                SKIP_DB=true
                shift
                ;;
            --skip-maven)
                SKIP_MAVEN=true
                shift
                ;;
            --export)
                EXPORT_JSON=true
                shift
                ;;
            -h|--help)
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  -v, --verbose    Mode détaillé"
                echo "  -q, --quiet      Mode silencieux (minimum d'output)"
                echo "  --fix            Tenter correction automatique"
                echo "  --skip-db        Ignorer vérifications base de données"
                echo "  --skip-maven     Ignorer compilation et tests Maven"
                echo "  --export         Exporter rapport en JSON"
                echo "  -h, --help       Afficher cette aide"
                exit 0
                ;;
            *)
                shift
                ;;
        esac
    done
}

# ============================================================================
# MAIN
# ============================================================================
main() {
    parse_args "$@"
    
    print_header
    
    step1_structure
    step2_essential_files
    step3_entities
    step4_repositories
    step5_services
    step6_controllers
    step7_configuration
    step8_pom_dependencies
    step9_database
    step10_maven_compile
    step11_unit_tests
    step12_docker
    step13_startup_order
    step14_endpoints
    step15_final_report
    
    generate_report
    
    if [[ "$EXPORT_JSON" == true ]]; then
        generate_json_report
    fi
    
    # Code de sortie
    if [[ $FAIL_COUNT -gt 0 ]]; then
        exit 1
    else
        exit 0
    fi
}

main "$@"
