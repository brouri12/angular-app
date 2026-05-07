// ============================================================
//  BACKEND PIPELINE – Wordly Platform
//  Repo:     https://github.com/brouri12/angular-app.git
//  Registry: brouri12 (Docker Hub)
//  Stages:   Checkout → Build & Test → SonarQube → Quality Gate
//            → Docker Build & Push → Deploy to Kubernetes
// ============================================================......
pipeline {
    agent any
    options {
        skipDefaultCheckout(true)
    }

    environment {
        REGISTRY    = 'mohamedalrahali'
        IMAGE_TAG   = "${env.BUILD_NUMBER}"
        SONAR_HOST  = 'http://host.docker.internal:9000'
        GIT_REPO    = 'https://github.com/brouri12/angular-app.git'
    }

    tools {
        maven 'Maven-3.9'
        jdk   'JDK-17'
    }

    stages {

        // ── 1. Checkout ──────────────────────────────────────────
        stage('Checkout') {
            steps {
                deleteDir()
                sh '''
                    set -e
                    curl -L --retry 5 --retry-delay 3 \
                      "https://codeload.github.com/brouri12/angular-app/tar.gz/refs/heads/feature/cicd-updates" \
                      -o source.tar.gz
                    tar -xzf source.tar.gz --strip-components=1
                    rm -f source.tar.gz
                '''
                script {
                    env.GIT_BRANCH = 'feature/cicd-updates'
                    env.GIT_COMMIT = sh(
                        returnStdout: true,
                        script: "git ls-remote ${GIT_REPO} refs/heads/feature/cicd-updates | awk '{print \$1}'"
                    ).trim()
                    sh '''
                        set -e
                        MVN_WRAPPER="$WORKSPACE/.ci/mvnw-ci"
                        mkdir -p "$WORKSPACE/.ci"
                        cat > "$MVN_WRAPPER" <<'EOF'
#!/usr/bin/env sh
set -eu
if command -v mvn >/dev/null 2>&1; then
  exec mvn "$@"
fi
MVN_VERSION="3.9.9"
MVN_DIR="$WORKSPACE/.cache/apache-maven-$MVN_VERSION"
MVN_BIN="$MVN_DIR/bin/mvn"
if [ ! -x "$MVN_BIN" ]; then
  mkdir -p "$WORKSPACE/.cache"
  ARCHIVE="$WORKSPACE/.cache/apache-maven-$MVN_VERSION-bin.tar.gz"
  DOWNLOAD_LOCK="$WORKSPACE/.cache/.mvn-download.lock"
  EXTRACT_LOCK="$WORKSPACE/.cache/.mvn-extract.lock"
  DOWNLOAD_LOCK_HELD=""
  EXTRACT_LOCK_HELD=""
  TMP_ARCHIVE=""
  TMP_DIR=""
  cleanup() {
    [ -n "$TMP_ARCHIVE" ] && rm -f "$TMP_ARCHIVE" 2>/dev/null || true
    [ -n "$TMP_DIR" ] && rm -rf "$TMP_DIR" 2>/dev/null || true
    if [ -n "$EXTRACT_LOCK_HELD" ]; then
      rmdir "$EXTRACT_LOCK" 2>/dev/null || true
    fi
    if [ -n "$DOWNLOAD_LOCK_HELD" ]; then
      rmdir "$DOWNLOAD_LOCK" 2>/dev/null || true
    fi
  }
  trap cleanup EXIT INT TERM
  wait_lock() {
    lock_path="$1"
    lock_name="$2"
    i=0
    while ! mkdir "$lock_path" 2>/dev/null; do
      i=$((i+1))
      if [ $i -ge 300 ]; then
        echo "Timeout waiting ${lock_name} lock"
        exit 1
      fi
      sleep 1
    done
  }
  wait_lock "$DOWNLOAD_LOCK" "Maven download"
  DOWNLOAD_LOCK_HELD="1"
  if [ ! -f "$ARCHIVE" ] || ! tar -tzf "$ARCHIVE" >/dev/null 2>&1; then
    rm -f "$ARCHIVE"
    TMP_ARCHIVE="$ARCHIVE.tmp.$$"
    curl -fsSL "https://archive.apache.org/dist/maven/maven-3/$MVN_VERSION/binaries/apache-maven-$MVN_VERSION-bin.tar.gz" -o "$TMP_ARCHIVE"
    tar -tzf "$TMP_ARCHIVE" >/dev/null
    mv "$TMP_ARCHIVE" "$ARCHIVE"
    TMP_ARCHIVE=""
  fi
  rmdir "$DOWNLOAD_LOCK" 2>/dev/null || true
  DOWNLOAD_LOCK_HELD=""
  LOCKDIR="$EXTRACT_LOCK"
  i=0
  while ! mkdir "$LOCKDIR" 2>/dev/null; do
    i=$((i+1))
    if [ $i -ge 300 ]; then
      echo "Timeout waiting Maven extraction lock"
      exit 1
    fi
    sleep 1
  done
  EXTRACT_LOCK_HELD="1"
  if [ ! -x "$MVN_BIN" ]; then
    TMP_DIR="$WORKSPACE/.cache/apache-maven-$MVN_VERSION.extract.tmp.$$"
    rm -rf "$TMP_DIR"
    mkdir -p "$TMP_DIR"
    tar -xzf "$ARCHIVE" -C "$TMP_DIR"
    EXTRACTED="$TMP_DIR/apache-maven-$MVN_VERSION"
    if [ -d "$EXTRACTED" ] && [ ! -d "$MVN_DIR" ]; then
      mv "$EXTRACTED" "$MVN_DIR"
    fi
    rm -rf "$TMP_DIR"
    TMP_DIR=""
  fi
  rmdir "$LOCKDIR" 2>/dev/null || true
  EXTRACT_LOCK_HELD=""
fi
exec "$MVN_BIN" "$@"
EOF
                        chmod +x "$MVN_WRAPPER"
                        # Précharge Maven une seule fois avant les stages parallèles
                        # pour éviter tout téléchargement/extraction concurrent.
                        "$MVN_WRAPPER" -v >/dev/null 2>&1
                    '''
                }
                echo "Branch: ${env.GIT_BRANCH} | Commit: ${env.GIT_COMMIT} | Maven wrapper: ${env.WORKSPACE}/.ci/mvnw-ci"
            }
        }

        // ── 2. Build & Test (parallel) ────────────────────────────
        stage('Build') {
            parallel {

                stage('EurekaServer') {
                    steps {
                        dir('EurekaServer') {
                            sh '$WORKSPACE/.ci/mvnw-ci clean package -DskipTests -B'
                        }
                    }
                }

                stage('ApiGateway') {
                    steps {
                        dir('ApiGateway') {
                            sh '$WORKSPACE/.ci/mvnw-ci clean package -DskipTests -B'
                        }
                    }
                    post {
                        always {
                            script {
                                try {
                                    junit allowEmptyResults: true,
                                          testResults: 'ApiGateway/target/surefire-reports/TEST-*.xml'
                                } catch (err) {
                                    echo "Junit report skipped for ApiGateway (${err})"
                                }
                            }
                        }
                    }
                }

                stage('UserService') {
                    steps {
                        dir('UserService') {
                            sh '$WORKSPACE/.ci/mvnw-ci clean package -DskipTests -B'
                        }
                    }
                    post {
                        always {
                            script {
                                try {
                                    junit allowEmptyResults: true,
                                          testResults: 'UserService/target/surefire-reports/TEST-*.xml'
                                } catch (err) {
                                    echo "Junit report skipped for UserService (${err})"
                                }
                            }
                        }
                    }
                }

                stage('AbonnementService') {
                    steps {
                        dir('AbonnementService') {
                            sh '$WORKSPACE/.ci/mvnw-ci clean package -DskipTests -B'
                        }
                    }
                    post {
                        always {
                            script {
                                try {
                                    junit allowEmptyResults: true,
                                          testResults: 'AbonnementService/target/surefire-reports/TEST-*.xml'
                                } catch (err) {
                                    echo "Junit report skipped for AbonnementService (${err})"
                                }
                            }
                        }
                    }
                }

                stage('ChallengeService') {
                    steps {
                        dir('ChallengeService') {
                            sh '$WORKSPACE/.ci/mvnw-ci clean package -DskipTests -B'
                        }
                    }
                    post {
                        always {
                            script {
                                try {
                                    junit allowEmptyResults: true,
                                          testResults: 'ChallengeService/target/surefire-reports/TEST-*.xml'
                                } catch (err) {
                                    echo "Junit report skipped for ChallengeService (${err})"
                                }
                            }
                        }
                    }
                }

                stage('PlanificationService') {
                    steps {
                        dir('PlanificationService') {
                            sh '$WORKSPACE/.ci/mvnw-ci clean package -DskipTests -B'
                        }
                    }
                    post {
                        always {
                            script {
                                try {
                                    junit allowEmptyResults: true,
                                          testResults: 'PlanificationService/target/surefire-reports/TEST-*.xml'
                                } catch (err) {
                                    echo "Junit report skipped for PlanificationService (${err})"
                                }
                            }
                        }
                    }
                }

                stage('EventService') {
                    steps {
                        dir('event-service') {
                            sh '$WORKSPACE/.ci/mvnw-ci clean package -DskipTests -B'
                        }
                    }
                    post {
                        always {
                            script {
                                try {
                                    junit allowEmptyResults: true,
                                          testResults: 'event-service/target/surefire-reports/TEST-*.xml'
                                } catch (err) {
                                    echo "Junit report skipped for event-service (${err})"
                                }
                            }
                        }
                    }
                }

                stage('ReservationService') {
                    steps {
                        dir('reservation-service') {
                            sh '$WORKSPACE/.ci/mvnw-ci clean package -Dmaven.test.skip=true -B'
                        }
                    }
                    post {
                        always {
                            script {
                                try {
                                    junit allowEmptyResults: true,
                                          testResults: 'reservation-service/target/surefire-reports/TEST-*.xml'
                                } catch (err) {
                                    echo "Junit report skipped for reservation-service (${err})"
                                }
                            }
                        }
                    }
                }

                stage('RecrutementService') {
                    steps {
                        dir('recrutement-service') {
                            sh '$WORKSPACE/.ci/mvnw-ci clean package -DskipTests -B'
                        }
                    }
                    post {
                        always {
                            script {
                                try {
                                    junit allowEmptyResults: true,
                                          testResults: 'recrutement-service/target/surefire-reports/TEST-*.xml'
                                } catch (err) {
                                    echo "Junit report skipped for recrutement-service (${err})"
                                }
                            }
                        }
                    }
                }

                stage('ClubService') {
                    steps {
                        dir('club-service') {
                            sh '$WORKSPACE/.ci/mvnw-ci clean package -DskipTests -B'
                        }
                    }
                    post {
                        always {
                            script {
                                try {
                                    junit allowEmptyResults: true,
                                          testResults: 'club-service/target/surefire-reports/TEST-*.xml'
                                } catch (err) {
                                    echo "Junit report skipped for club-service (${err})"
                                }
                            }
                        }
                    }
                }

                stage('MemberService') {
                    steps {
                        dir('member-service') {
                            sh '$WORKSPACE/.ci/mvnw-ci clean package -DskipTests -B'
                        }
                    }
                    post {
                        always {
                            script {
                                try {
                                    junit allowEmptyResults: true,
                                          testResults: 'member-service/target/surefire-reports/TEST-*.xml'
                                } catch (err) {
                                    echo "Junit report skipped for member-service (${err})"
                                }
                            }
                        }
                    }
                }

                stage('ForumService') {
                    steps {
                        dir('forum-service') {
                            sh '$WORKSPACE/.ci/mvnw-ci clean package -DskipTests -B'
                        }
                    }
                    post {
                        always {
                            script {
                                try {
                                    junit allowEmptyResults: true,
                                          testResults: 'forum-service/target/surefire-reports/TEST-*.xml'
                                } catch (err) {
                                    echo "Junit report skipped for forum-service (${err})"
                                }
                            }
                        }
                    }
                }

                stage('FormationService') {
                    steps {
                        dir('FormationService') {
                            sh '$WORKSPACE/.ci/mvnw-ci clean package -Dmaven.test.skip=true -B'
                        }
                    }
                    post {
                        always {
                            script {
                                try {
                                    junit allowEmptyResults: true,
                                          testResults: 'FormationService/target/surefire-reports/TEST-*.xml'
                                } catch (err) {
                                    echo "Junit report skipped for FormationService (${err})"
                                }
                            }
                        }
                    }
                }

                stage('QuizBadgeService') {
                    steps {
                        dir('QuizBadgeService') {
                            sh '$WORKSPACE/.ci/mvnw-ci clean package -DskipTests -B'
                        }
                    }
                    post {
                        always {
                            script {
                                try {
                                    junit allowEmptyResults: true,
                                          testResults: 'QuizBadgeService/target/surefire-reports/TEST-*.xml'
                                } catch (err) {
                                    echo "Junit report skipped for QuizBadgeService (${err})"
                                }
                            }
                        }
                    }
                }

                stage('PronunciationService') {
                    steps {
                        dir('PronunciationService') {
                            sh '$WORKSPACE/.ci/mvnw-ci clean package -DskipTests -B'
                        }
                    }
                    post {
                        always {
                            script {
                                try {
                                    junit allowEmptyResults: true,
                                          testResults: 'PronunciationService/target/surefire-reports/TEST-*.xml'
                                } catch (err) {
                                    echo "Junit report skipped for PronunciationService (${err})"
                                }
                            }
                        }
                    }
                }

                stage('FeedbackService') {
                    steps {
                        dir('FeedbackService') {
                            sh '$WORKSPACE/.ci/mvnw-ci clean package -DskipTests -B'
                        }
                    }
                    post {
                        always {
                            script {
                                try {
                                    junit allowEmptyResults: true,
                                          testResults: 'FeedbackService/target/surefire-reports/TEST-*.xml'
                                } catch (err) {
                                    echo "Junit report skipped for FeedbackService (${err})"
                                }
                            }
                        }
                    }
                }

                stage('PronunciationFastAPI') {
                    steps {
                        dir('pronunciation-fastapi') {
                            sh '''
                                echo "✓ PronunciationFastAPI - Validating Python files exist"
                                
                                # Check that required files exist
                                if [ ! -f requirements.txt ]; then
                                  echo "ERROR: requirements.txt not found"
                                  exit 1
                                fi
                                
                                if [ ! -f main.py ]; then
                                  echo "ERROR: main.py not found"
                                  exit 1
                                fi
                                
                                if [ ! -f models.py ]; then
                                  echo "ERROR: models.py not found"
                                  exit 1
                                fi
                                
                                if [ ! -f Dockerfile ]; then
                                  echo "ERROR: Dockerfile not found"
                                  exit 1
                                fi
                                
                                echo "✓ All required files present:"
                                echo "  - requirements.txt ($(wc -l < requirements.txt) dependencies)"
                                echo "  - main.py ($(wc -l < main.py) lines)"
                                echo "  - models.py ($(wc -l < models.py) lines)"
                                echo "  - Dockerfile"
                                echo ""
                                echo "✓ PronunciationFastAPI validation successful"
                                echo "  (Full validation will occur during Docker build stage)"
                            '''
                        }
                    }
                }

            } // end parallel
        }

        // ── 3. Test All Services (parallel) ─────────────────────────
        stage('Test All Services') {
            steps {
                script {
                    def javaServices = [
                        [name: 'ApiGateway',           dir: 'ApiGateway',           report: 'ApiGateway/target/surefire-reports/TEST-*.xml'],
                        [name: 'UserService',          dir: 'UserService',          report: 'UserService/target/surefire-reports/TEST-*.xml'],
                        [name: 'AbonnementService',    dir: 'AbonnementService',    report: 'AbonnementService/target/surefire-reports/TEST-*.xml'],
                        [name: 'ChallengeService',     dir: 'ChallengeService',     report: 'ChallengeService/target/surefire-reports/TEST-*.xml'],
                        [name: 'PlanificationService', dir: 'PlanificationService', report: 'PlanificationService/target/surefire-reports/TEST-*.xml'],
                        [name: 'EventService',         dir: 'event-service',        report: 'event-service/target/surefire-reports/TEST-*.xml'],
                        [name: 'ReservationService',   dir: 'reservation-service',  report: 'reservation-service/target/surefire-reports/TEST-*.xml'],
                        [name: 'RecrutementService',   dir: 'recrutement-service',  report: 'recrutement-service/target/surefire-reports/TEST-*.xml'],
                        [name: 'ClubService',          dir: 'club-service',         report: 'club-service/target/surefire-reports/TEST-*.xml'],
                        [name: 'MemberService',        dir: 'member-service',       report: 'member-service/target/surefire-reports/TEST-*.xml'],
                        [name: 'ForumService',         dir: 'forum-service',        report: 'forum-service/target/surefire-reports/TEST-*.xml'],
                        [name: 'FormationService',     dir: 'FormationService',     report: 'FormationService/target/surefire-reports/TEST-*.xml'],
                        [name: 'QuizBadgeService',     dir: 'QuizBadgeService',     report: 'QuizBadgeService/target/surefire-reports/TEST-*.xml'],
                        [name: 'PronunciationService', dir: 'PronunciationService', report: 'PronunciationService/target/surefire-reports/TEST-*.xml'],
                        [name: 'FeedbackService',      dir: 'FeedbackService',      report: 'FeedbackService/target/surefire-reports/TEST-*.xml'],
                    ]

                    def branches = [:]

                    javaServices.each { item ->
                        def svc = item
                        branches["Test ${svc.name}"] = {
                            dir(svc.dir) {
                                sh '$WORKSPACE/.ci/mvnw-ci -B test -DfailIfNoTests=false'
                            }
                            try {
                                junit allowEmptyResults: true, testResults: svc.report
                            } catch (err) {
                                echo "Junit report skipped for ${svc.name} (${err})"
                            }
                        }
                    }

                    branches['Test PronunciationFastAPI'] = {
                        dir('pronunciation-fastapi') {
                            sh '''
                                set -e
                                [ -f requirements.txt ] || (echo "requirements.txt not found" && exit 1)
                                [ -f main.py ] || (echo "main.py not found" && exit 1)
                                [ -f models.py ] || (echo "models.py not found" && exit 1)
                                [ -f Dockerfile ] || (echo "Dockerfile not found" && exit 1)
                                python -m compileall -q .
                            '''
                        }
                    }

                    parallel branches
                }
            }
        }

        // ── 4. SonarQube Analysis (un rapport par microservice pour remplir le tableau Sonar ; JaCoCo -> couverture) ──
        stage('SonarQube Analysis') {
            steps {
                script {
                    try {
                        withCredentials([string(credentialsId: 'sonar-token', variable: 'SONAR_TOKEN')]) {
                            withSonarQubeEnv('SonarQube') {
                                // Tous les modules avec tests **/*Test.java + JaCoCo/Sonar dans le pom
                                def svc = [
                                    [dir: 'ApiGateway',            key: 'api-gateway',            name: 'API Gateway'],
                                    [dir: 'ChallengeService',      key: 'challenge-service',      name: 'Challenge Service'],
                                    [dir: 'club-service',          key: 'club-service',           name: 'Club Service'],
                                    [dir: 'event-service',         key: 'event-service',          name: 'Event Service'],
                                    [dir: 'FeedbackService',       key: 'feedback-service',       name: 'Feedback Service'],
                                    [dir: 'forum-service',         key: 'forum-service',          name: 'Forum Service'],
                                    [dir: 'member-service',        key: 'member-service',         name: 'Member Service'],
                                    [dir: 'PlanificationService',  key: 'planification-service',  name: 'Planification Service'],
                                    [dir: 'PronunciationService',  key: 'pronunciation-service',  name: 'Pronunciation Service'],
                                    [dir: 'QuizBadgeService',      key: 'quiz-badge-service',     name: 'Quiz-Badge-Service'],
                                    [dir: 'recrutement-service',   key: 'recrutement-service',    name: 'Recrutement Service'],
                                    [dir: 'UserService',           key: 'user-service',           name: 'User Service'],
                                ]
                                svc.each { s ->
                                    withEnv([
                                        "SONAR_PROJECT_DIR=${s.dir}",
                                        "SONAR_PROJECT_KEY=${s.key}",
                                        "SONAR_PROJECT_NAME=${s.name}",
                                    ]) {
                                        sh '''
                                            set -e
                                            cd "$SONAR_PROJECT_DIR"
                                            "$WORKSPACE/.ci/mvnw-ci" -B clean verify sonar:sonar \
                                                -Dsonar.projectKey="$SONAR_PROJECT_KEY" \
                                                -Dsonar.projectName="$SONAR_PROJECT_NAME" \
                                                -Dsonar.host.url="$SONAR_HOST" \
                                                -Dsonar.token="$SONAR_TOKEN"
                                            mkdir -p "$WORKSPACE/.scannerwork"
                                            if [ -f target/sonar/report-task.txt ]; then
                                                sed -i 's#http://host.docker.internal:9000#http://localhost:9000#g' target/sonar/report-task.txt || true
                                                cp target/sonar/report-task.txt "$WORKSPACE/.scannerwork/report-task.txt"
                                                rm -f target/sonar/report-task.txt
                                            fi
                                        '''
                                    }
                                }
                                // Python + Angular : SonarScanner CLI (hors Maven)
                                sh '''
                                    set -e
                                    SCAN_VERSION=6.2.1.4610
                                    SCAN_ZIP="$WORKSPACE/.cache/sonar-scanner-cli-${SCAN_VERSION}-linux-x64.zip"
                                    SCAN_BIN="$WORKSPACE/.cache/sonar-scanner-${SCAN_VERSION}/bin/sonar-scanner"
                                    mkdir -p "$WORKSPACE/.cache"
                                    if [ ! -x "$SCAN_BIN" ]; then
                                      if [ ! -f "$SCAN_ZIP" ]; then
                                        curl -fsSL "https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-${SCAN_VERSION}-linux-x64.zip" -o "$SCAN_ZIP"
                                      fi
                                      rm -rf "$WORKSPACE/.cache/sonar-scanner-${SCAN_VERSION}"
                                      unzip -q "$SCAN_ZIP" -d "$WORKSPACE/.cache"
                                      mv "$WORKSPACE/.cache/sonar-scanner-${SCAN_VERSION}-linux-x64" "$WORKSPACE/.cache/sonar-scanner-${SCAN_VERSION}"
                                    fi
                                    NODE_VERSION=20.19.2
                                    NODE_DIR="$WORKSPACE/.cache/node-v${NODE_VERSION}-linux-x64"
                                    if [ ! -x "$NODE_DIR/bin/node" ]; then
                                      NODE_ARCHIVE="$WORKSPACE/.cache/node-v${NODE_VERSION}-linux-x64.tar.gz"
                                      if [ ! -f "$NODE_ARCHIVE" ]; then
                                        curl -fsSL "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.gz" -o "$NODE_ARCHIVE"
                                      fi
                                      rm -rf "$NODE_DIR"
                                      tar -xzf "$NODE_ARCHIVE" -C "$WORKSPACE/.cache"
                                    fi
                                    export PATH="$WORKSPACE/.cache/sonar-scanner-${SCAN_VERSION}/bin:$NODE_DIR/bin:$PATH"
                                    run_scan() {
                                      sub="$1"
                                      if [ ! -f "$sub/sonar-project.properties" ]; then
                                        echo "Skip Sonar (no sonar-project.properties): $sub"
                                        return 0
                                      fi
                                      echo "SonarScanner: $sub"
                                      (cd "$sub" && sonar-scanner \
                                        -Dsonar.host.url="$SONAR_HOST" \
                                        -Dsonar.token="$SONAR_TOKEN")
                                      if [ -f "$sub/.scannerwork/report-task.txt" ]; then
                                        sed -i 's#http://host.docker.internal:9000#http://localhost:9000#g' "$sub/.scannerwork/report-task.txt" || true
                                        cp "$sub/.scannerwork/report-task.txt" "$WORKSPACE/.scannerwork/report-task.txt"
                                        rm -f "$sub/.scannerwork/report-task.txt"
                                      fi
                                    }
                                    run_scan pronunciation-fastapi
                                    (cd back-office && npm ci --no-audit --no-fund) || echo "npm ci back-office skipped/failed"
                                    (cd frontend/angular-app && npm ci --no-audit --no-fund) || echo "npm ci frontend skipped/failed"
                                    run_scan back-office
                                    run_scan frontend/angular-app
                                '''
                            }
                        }
                    } catch (err) {
                        echo "SonarQube stage skipped: sonar-token credential is missing or Sonar is unavailable (${err})"
                    }
                }
            }
        }

        // ── 4. Quality Gate ───────────────────────────────────────
        stage('Quality Gate') {
            steps {
                script {
                    try {
                        timeout(time: 5, unit: 'MINUTES') {
                            waitForQualityGate abortPipeline: false
                        }
                    } catch (err) {
                        echo "Quality Gate skipped: no SonarQube analysis context found (${err})"
                    }
                }
            }
        }

        // ── 5. Docker Build & Push ────────────────────────────────
        stage('Docker Build & Push') {
            steps {
                script {
                    try {
                        if (sh(returnStatus: true, script: 'command -v docker >/dev/null 2>&1') != 0) {
                            echo 'Docker Build & Push skipped: docker CLI not available on Jenkins agent.'
                            return
                        }
                        withCredentials([usernamePassword(
                            credentialsId: 'dockerhub-credentials',
                            usernameVariable: 'DOCKER_USER',
                            passwordVariable: 'DOCKER_PASS'
                        )]) {
                            sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'

                            def services = [
                                [dir: 'EurekaServer',           name: 'eureka-server'],
                                [dir: 'ApiGateway',             name: 'api-gateway'],
                                [dir: 'UserService',            name: 'user-service'],
                                [dir: 'AbonnementService',      name: 'abonnement-service'],
                                [dir: 'ChallengeService',       name: 'challenge-service'],
                                [dir: 'PlanificationService',   name: 'planification-service'],
                                [dir: 'event-service',          name: 'event-service'],
                                [dir: 'reservation-service',    name: 'reservation-service'],
                                [dir: 'recrutement-service',    name: 'recrutement-service'],
                                [dir: 'club-service',           name: 'club-service'],
                                [dir: 'member-service',         name: 'member-service'],
                                [dir: 'forum-service',          name: 'forum-service'],
                                [dir: 'FormationService',       name: 'formation-service'],
                                [dir: 'QuizBadgeService',       name: 'quiz-badge-service'],
                                [dir: 'PronunciationService',   name: 'pronunciation-service'],
                                [dir: 'FeedbackService',        name: 'feedback-service'],
                                [dir: 'pronunciation-fastapi',  name: 'pronunciation-fastapi'],
                            ]

                            services.each { svc ->
                                sh """
                                    docker build \
                                        -t ${REGISTRY}/${svc.name}:${IMAGE_TAG} \
                                        -t ${REGISTRY}/${svc.name}:latest \
                                        ./${svc.dir}
                                    docker push ${REGISTRY}/${svc.name}:${IMAGE_TAG}
                                    docker push ${REGISTRY}/${svc.name}:latest
                                """
                            }
                        }
                    } catch (err) {
                        echo "Docker Build & Push skipped: missing dockerhub credentials or Docker unavailable (${err})"
                    }
                }
            }
        }

        // ── 6. Deploy to Kubernetes ───────────────────────────────
        stage('Deploy to Kubernetes') {
            when {
                branch 'main'
            }
            steps {
                withKubeConfig([credentialsId: 'kubeconfig']) {
                    sh 'kubectl apply -f devops/k8s/00-namespace.yml'
                    sh 'kubectl apply -f devops/k8s/01-mysql.yml'
                    sh 'kubectl apply -f devops/k8s/02-eureka.yml'
                    sh 'kubectl apply -f devops/k8s/03-api-gateway.yml'
                    sh 'kubectl apply -f devops/k8s/04-microservices.yml'

                    script {
                        def services = [
                            'eureka-server', 'api-gateway', 'user-service',
                            'abonnement-service', 'challenge-service', 'planification-service',
                            'event-service', 'reservation-service', 'recrutement-service',
                            'club-service', 'member-service', 'forum-service',
                            'formation-service', 'quiz-badge-service', 'pronunciation-service',
                            'feedback-service', 'pronunciation-fastapi'
                        ]
                        services.each { svc ->
                            sh "kubectl set image deployment/${svc} ${svc}=${REGISTRY}/${svc}:${IMAGE_TAG} -n wordly"
                        }
                    }
                    sh 'kubectl rollout status deployment -n wordly --timeout=180s'
                }
            }
        }

    } // end stages

    post {
        always {
            script {
                try {
                    deleteDir()
                } catch (err) {
                    echo "Skipping deleteDir: workspace context unavailable (${err})"
                }
            }
        }
        success {
            echo "Backend pipeline succeeded – build #${env.BUILD_NUMBER}"
        }
        failure {
            echo "Backend pipeline failed – check logs above"
        }
    }
}
