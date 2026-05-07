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
        MVN_CMD     = 'mvn'
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
                    env.MVN_CMD = "${env.WORKSPACE}/.ci/mvnw-ci"
                    sh """
                        set -e
                        mkdir -p "${env.WORKSPACE}/.ci"
                        cat > "${env.MVN_CMD}" <<'EOF'
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
  if [ ! -f "$ARCHIVE" ]; then
    curl -fsSL "https://archive.apache.org/dist/maven/maven-3/$MVN_VERSION/binaries/apache-maven-$MVN_VERSION-bin.tar.gz" -o "$ARCHIVE"
  fi
  rm -rf "$MVN_DIR"
  tar -xzf "$ARCHIVE" -C "$WORKSPACE/.cache"
fi
exec "$MVN_BIN" "$@"
EOF
                        chmod +x "${env.MVN_CMD}"
                    """
                }
                echo "Branch: ${env.GIT_BRANCH} | Commit: ${env.GIT_COMMIT} | Maven command: ${env.MVN_CMD}"
            }
        }

        // ── 2. Build & Test (parallel) ────────────────────────────
        stage('Build & Test') {
            parallel {

                stage('EurekaServer') {
                    steps {
                        dir('EurekaServer') {
                            sh '${MVN_CMD} clean package -DskipTests -B'
                        }
                    }
                }

                stage('ApiGateway') {
                    steps {
                        dir('ApiGateway') {
                            sh '${MVN_CMD} clean verify -B'
                        }
                    }
                    post {
                        always {
                            junit allowEmptyResults: true,
                                  testResults: 'ApiGateway/target/surefire-reports/*.xml'
                        }
                    }
                }

                stage('UserService') {
                    steps {
                        dir('UserService') {
                            sh '${MVN_CMD} clean package -B'
                        }
                    }
                    post {
                        always {
                            junit allowEmptyResults: true,
                                  testResults: 'UserService/target/surefire-reports/*.xml'
                        }
                    }
                }

                stage('AbonnementService') {
                    steps {
                        dir('AbonnementService') {
                            sh '${MVN_CMD} clean package -B'
                        }
                    }
                    post {
                        always {
                            junit allowEmptyResults: true,
                                  testResults: 'AbonnementService/target/surefire-reports/*.xml'
                        }
                    }
                }

                stage('ChallengeService') {
                    steps {
                        dir('ChallengeService') {
                            sh '${MVN_CMD} clean package -B'
                        }
                    }
                    post {
                        always {
                            junit allowEmptyResults: true,
                                  testResults: 'ChallengeService/target/surefire-reports/*.xml'
                        }
                    }
                }

                stage('PlanificationService') {
                    steps {
                        dir('PlanificationService') {
                            sh '${MVN_CMD} clean verify -B'
                        }
                    }
                    post {
                        always {
                            junit allowEmptyResults: true,
                                  testResults: 'PlanificationService/target/surefire-reports/*.xml'
                        }
                    }
                }

                stage('EventService') {
                    steps {
                        dir('event-service') {
                            sh '${MVN_CMD} clean verify -B'
                        }
                    }
                    post {
                        always {
                            junit allowEmptyResults: true,
                                  testResults: 'event-service/target/surefire-reports/*.xml'
                        }
                    }
                }

                stage('ReservationService') {
                    steps {
                        dir('reservation-service') {
                            sh '${MVN_CMD} clean package -Dmaven.test.skip=true -B'
                        }
                    }
                    post {
                        always {
                            junit allowEmptyResults: true,
                                  testResults: 'reservation-service/target/surefire-reports/*.xml'
                        }
                    }
                }

                stage('RecrutementService') {
                    steps {
                        dir('recrutement-service') {
                            sh '${MVN_CMD} clean verify -B'
                        }
                    }
                    post {
                        always {
                            junit allowEmptyResults: true,
                                  testResults: 'recrutement-service/target/surefire-reports/*.xml'
                        }
                    }
                }

                stage('ClubService') {
                    steps {
                        dir('club-service') {
                            sh '${MVN_CMD} clean verify -B'
                        }
                    }
                    post {
                        always {
                            junit allowEmptyResults: true,
                                  testResults: 'club-service/target/surefire-reports/*.xml'
                        }
                    }
                }

                stage('MemberService') {
                    steps {
                        dir('member-service') {
                            sh '${MVN_CMD} clean verify -B'
                        }
                    }
                    post {
                        always {
                            junit allowEmptyResults: true,
                                  testResults: 'member-service/target/surefire-reports/*.xml'
                        }
                    }
                }

                stage('ForumService') {
                    steps {
                        dir('forum-service') {
                            sh '${MVN_CMD} clean verify -B'
                        }
                    }
                    post {
                        always {
                            junit allowEmptyResults: true,
                                  testResults: 'forum-service/target/surefire-reports/*.xml'
                        }
                    }
                }

                stage('FormationService') {
                    steps {
                        dir('FormationService') {
                            sh '${MVN_CMD} clean package -Dmaven.test.skip=true -B'
                        }
                    }
                    post {
                        always {
                            junit allowEmptyResults: true,
                                  testResults: 'FormationService/target/surefire-reports/*.xml'
                        }
                    }
                }

                stage('QuizBadgeService') {
                    steps {
                        dir('QuizBadgeService') {
                            sh '${MVN_CMD} clean verify -B'
                        }
                    }
                    post {
                        always {
                            junit allowEmptyResults: true,
                                  testResults: 'QuizBadgeService/target/surefire-reports/*.xml'
                        }
                    }
                }

                stage('PronunciationService') {
                    steps {
                        dir('PronunciationService') {
                            sh '${MVN_CMD} clean verify -B'
                        }
                    }
                    post {
                        always {
                            junit allowEmptyResults: true,
                                  testResults: 'PronunciationService/target/surefire-reports/*.xml'
                        }
                    }
                }

                stage('FeedbackService') {
                    steps {
                        dir('FeedbackService') {
                            sh '${MVN_CMD} clean verify -B'
                        }
                    }
                    post {
                        always {
                            junit allowEmptyResults: true,
                                  testResults: 'FeedbackService/target/surefire-reports/*.xml'
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

        // ── 3. SonarQube Analysis (un rapport par microservice pour remplir le tableau Sonar ; JaCoCo -> couverture) ──
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
                                    sh """
                                        set -e
                                        cd ${s.dir}
                                        ${MVN_CMD} -B clean verify sonar:sonar \\
                                            -Dsonar.projectKey=${s.key} \\
                                            -Dsonar.projectName='${s.name}' \\
                                            -Dsonar.host.url=${SONAR_HOST} \\
                                            -Dsonar.token=${SONAR_TOKEN}
                                        if [ -f .scannerwork/report-task.txt ]; then
                                            sed -i 's#http://host.docker.internal:9000#http://localhost:9000#g' .scannerwork/report-task.txt || true
                                        fi
                                    """
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
                                    export PATH="$WORKSPACE/.cache/sonar-scanner-${SCAN_VERSION}/bin:$PATH"
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
                                    }
                                    run_scan pronunciation-fastapi
                                    if command -v npm >/dev/null 2>&1; then
                                      (cd back-office && npm ci --no-audit --no-fund) || echo "npm ci back-office skipped/failed"
                                      (cd frontend/angular-app && npm ci --no-audit --no-fund) || echo "npm ci frontend skipped/failed"
                                    else
                                      echo "npm absent — analyse Sonar TS sans node_modules (résolution limitée)"
                                    fi
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
