import { Injectable, inject } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly keycloak = inject(KeycloakService);

  isLoggedIn(): boolean {
    return this.keycloak.isLoggedIn();
  }

  async getUserProfile(): Promise<KeycloakProfile | null> {
    try {
      if (this.isLoggedIn()) {
        return await this.keycloak.loadUserProfile();
      }
      return null;
    } catch (error) {
      console.error('Error loading user profile', error);
      return null;
    }
  }

  getUserId(): string | undefined {
    const token = this.keycloak.getKeycloakInstance().tokenParsed;
    return token?.sub;
  }

  getToken(): string | undefined {
    return this.keycloak.getKeycloakInstance().token;
  }

  logout(): void {
    this.keycloak.logout(window.location.origin);
  }

  getUserRoles(): string[] {
    return this.keycloak.getUserRoles();
  }

  hasRole(role: string): boolean {
    return this.keycloak.isUserInRole(role);
  }
}
