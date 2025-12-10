import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Skip auth header if bypass is enabled
  if (environment.bypassAuth) {
    return next(req);
  }

  const keycloak = inject(KeycloakService);

  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  const token = keycloak.getKeycloakInstance().token;

  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(authReq);
  }

  return next(req);
};
