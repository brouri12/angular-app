import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import Keycloak from 'keycloak-js';
import { environment } from './environments/environment';

const keycloak = new Keycloak({
  url: environment.keycloak.url,
  realm: environment.keycloak.realm,
  clientId: environment.keycloak.clientId,
});

keycloak
  .init({
    onLoad: 'login-required',
    // silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html', // Disabled
    checkLoginIframe: false,
    pkceMethod: 'S256'
  })
  .then(authenticated => {
    console.log('Keycloak authenticated:', authenticated);
    if (!authenticated) {
      keycloak.login();
    }
    (window as any).keycloak = keycloak;
    bootstrapApplication(App, appConfig).catch(err => console.error(err));
  })
  .catch((err) => {
    console.error('Keycloak init failed', err);
  });

// export it if you want to use in services/components
export { keycloak };