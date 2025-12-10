import { KeycloakService } from 'keycloak-angular';
import { environment } from '../../../environments/environment';

export function initializeKeycloak(keycloak: KeycloakService): () => Promise<boolean> {
  return () => {
    // Bypass Keycloak initialization if bypassAuth is enabled
    if (environment.bypassAuth) {
      console.log('Auth bypass enabled - skipping Keycloak initialization');
      return Promise.resolve(true);
    }

    return keycloak.init({
      config: {
        url: environment.keycloak.url,
        realm: environment.keycloak.realm,
        clientId: environment.keycloak.clientId,
      },
      initOptions: {
        onLoad: 'login-required',
        checkLoginIframe: false,
      },
      enableBearerInterceptor: false,
      bearerPrefix: 'Bearer',
      bearerExcludedUrls: ['/assets', '/public'],
    });
  };
}
