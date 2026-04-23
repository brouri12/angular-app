// ============================================================
//  BACKEND PIPELINE – Wordly Platform
//  Repo:     https://github.com/brouri12/angular-app.git
//  Registry: brouri12 (Docker Hub)
//  Stages:   Checkout → Build & Test → SonarQube → Quality Gate
//            → Docker Build & Push → Deploy to Kubernetes
// ============================================================
pipeline {
    agent any

    environment {
        REGISTRY    = 'brouri12'
        IMAGE_TAG   = "${env.BUILD_NUMBER}"
        SONAR_HOST  = 'http://wordly-sonarqube:9000'
        SONAR_TOKEN = credentials('sonar-token')
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
                git branch: 'main',
                    url: "${GIT_REPO}",
                    credentialsId: 'github-credentials'
                echo "Branch: ${env.GIT_BRANCH} | Commit: ${env.GIT_COMMIT}"
            }
        }

        // ── 2. Build & Test (parallel) ────────────────────────────
        stage('Build & Test') {
            parallel {

                stage('EurekaServer') {
                    steps {
                        dir('EurekaServer') {
                            sh 'mvn clean package -DskipTests -B'
                        }
                    }
                }

                stage('ApiGateway') {
                    steps {
                        dir('ApiGateway') {
                            sh 'mvn clean package -DskipTests -B'
                        }
                    }
                }

                stage('UserService') {
                    steps {
                        dir('UserService') {
                            sh 'mvn clean package -B'
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
                            sh 'mvn clean package -B'
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
                            sh 'mvn clean package -B'
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
                            sh 'mvn clean package -B'
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
                            sh 'mvn clean package -B'
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
                            sh 'mvn clean package -B'
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
                            sh 'mvn clean package -B'
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
                            sh 'mvn clean package -B'
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
                            sh 'mvn clean package -B'
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
                            sh 'mvn clean package -B'
                        }
                    }
                    post {
                        always {
                            junit allowEmptyResults: true,
                                  testResults: 'forum-service/target/surefire-reports/*.xml'
                        }
                    }
                }

            } // end parallel
        }

        // ── 3. SonarQube Analysis ─────────────────────────────────
        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh """
                        cd UserService && mvn sonar:sonar \
                            -Dsonar.projectKey=user-service \
                            -Dsonar.projectName="User Service" \
                            -Dsonar.host.url=${SONAR_HOST} \
                            -Dsonar.token=${SONAR_TOKEN} -B
                    """
                    sh """
                        cd ChallengeService && mvn sonar:sonar \
                            -Dsonar.projectKey=challenge-service \
                            -Dsonar.projectName="Challenge Service" \
                            -Dsonar.host.url=${SONAR_HOST} \
                            -Dsonar.token=${SONAR_TOKEN} -B
                    """
                    sh """
                        cd AbonnementService && mvn sonar:sonar \
                            -Dsonar.projectKey=abonnement-service \
                            -Dsonar.projectName="Abonnement Service" \
                            -Dsonar.host.url=${SONAR_HOST} \
                            -Dsonar.token=${SONAR_TOKEN} -B
                    """
                    sh """
                        cd recrutement-service && mvn sonar:sonar \
                            -Dsonar.projectKey=recrutement-service \
                            -Dsonar.projectName="Recrutement Service" \
                            -Dsonar.host.url=${SONAR_HOST} \
                            -Dsonar.token=${SONAR_TOKEN} -B
                    """
                    sh """
                        cd forum-service && mvn sonar:sonar \
                            -Dsonar.projectKey=forum-service \
                            -Dsonar.projectName="Forum Service" \
                            -Dsonar.host.url=${SONAR_HOST} \
                            -Dsonar.token=${SONAR_TOKEN} -B
                    """
                    sh """
                        cd PlanificationService && mvn sonar:sonar \
                            -Dsonar.projectKey=planification-service \
                            -Dsonar.projectName="Planification Service" \
                            -Dsonar.host.url=${SONAR_HOST} \
                            -Dsonar.token=${SONAR_TOKEN} -B
                    """
                    sh """
                        cd event-service && mvn sonar:sonar \
                            -Dsonar.projectKey=event-service \
                            -Dsonar.projectName="Event Service" \
                            -Dsonar.host.url=${SONAR_HOST} \
                            -Dsonar.token=${SONAR_TOKEN} -B
                    """
                    sh """
                        cd reservation-service && mvn sonar:sonar \
                            -Dsonar.projectKey=reservation-service \
                            -Dsonar.projectName="Reservation Service" \
                            -Dsonar.host.url=${SONAR_HOST} \
                            -Dsonar.token=${SONAR_TOKEN} -B
                    """
                    sh """
                        cd club-service && mvn sonar:sonar \
                            -Dsonar.projectKey=club-service \
                            -Dsonar.projectName="Club Service" \
                            -Dsonar.host.url=${SONAR_HOST} \
                            -Dsonar.token=${SONAR_TOKEN} -B
                    """
                    sh """
                        cd member-service && mvn sonar:sonar \
                            -Dsonar.projectKey=member-service \
                            -Dsonar.projectName="Member Service" \
                            -Dsonar.host.url=${SONAR_HOST} \
                            -Dsonar.token=${SONAR_TOKEN} -B
                    """
                }
            }
        }

        // ── 4. Quality Gate ───────────────────────────────────────
        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: false
                }
            }
        }

        // ── 5. Docker Build & Push ────────────────────────────────
        stage('Docker Build & Push') {
            steps {
                script {
                    withCredentials([usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )]) {
                        sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'

                        def services = [
                            [dir: 'EurekaServer',         name: 'eureka-server'],
                            [dir: 'ApiGateway',           name: 'api-gateway'],
                            [dir: 'UserService',          name: 'user-service'],
                            [dir: 'AbonnementService',    name: 'abonnement-service'],
                            [dir: 'ChallengeService',     name: 'challenge-service'],
                            [dir: 'PlanificationService', name: 'planification-service'],
                            [dir: 'event-service',        name: 'event-service'],
                            [dir: 'reservation-service',  name: 'reservation-service'],
                            [dir: 'recrutement-service',  name: 'recrutement-service'],
                            [dir: 'club-service',         name: 'club-service'],
                            [dir: 'member-service',       name: 'member-service'],
                            [dir: 'forum-service',        name: 'forum-service'],
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
                            'club-service', 'member-service', 'forum-service'
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
            junit allowEmptyResults: true,
                  testResults: '**/target/surefire-reports/*.xml'
            cleanWs()
        }
        success {
            echo "Backend pipeline succeeded – build #${env.BUILD_NUMBER}"
        }
        failure {
            echo "Backend pipeline failed – check logs above"
        }
    }
}
