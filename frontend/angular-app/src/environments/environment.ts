// Development environment
// Direct calls to game service (port 8077) — switch apiGatewayUrl when running through gateway
export const environment = {
  production: false,
  gameServiceUrl: 'http://localhost:8077',
  libraryServiceUrl: 'http://localhost:8078',
  apiGatewayUrl: 'http://localhost:8080',
  apiTimeout: 30000,
  retryConfig: {
    count: 2,
    delay: 1000
  }
};
