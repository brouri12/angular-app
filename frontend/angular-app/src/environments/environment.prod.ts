// Production environment — all traffic through API Gateway
export const environment = {
  production: true,
  gameServiceUrl: 'http://localhost:8080',
  libraryServiceUrl: 'http://localhost:8080',
  apiGatewayUrl: 'http://localhost:8080',
  apiTimeout: 30000,
  retryConfig: {
    count: 2,
    delay: 1000
  }
};
