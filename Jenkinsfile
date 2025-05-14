pipeline {
  agent any

  environment {
    IMAGE_TAG = "${new Date().format('yyyyMMddHHmmss')}"
  }

  stages {
    stage('Clone Repository') {
      steps {
        checkout scm
      }
    }

    stage('Build Docker Images') {
      steps {
        sh 'docker-compose build --no-cache'
      }
    }

    stage('Deploy Application') {
      steps {
        sh '''
          docker-compose down
          docker-compose up -d
        '''
      }
    }
  }

  post {
    success {
      echo '✅ Deployment successful!'
    }
    failure {
      echo '❌ Deployment failed.'
    }
  }
}
