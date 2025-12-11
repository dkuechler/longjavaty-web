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

  /**
   * Get the user's age from Keycloak token claims.
   * Requires 'age' custom attribute to be configured in Keycloak
   * and included in token via protocol mapper.
   * @returns The user's age, or undefined if not available
   */
  getUserAge(): number | undefined {
    try {
      const instance = this.keycloak.getKeycloakInstance();
      if (!instance) {
        return undefined;
      }
      return instance.tokenParsed?.['age'];
    } catch {
      return undefined;
    }
  }

  /**
   * Update user profile in Keycloak.
   * @param profile Partial profile data to update
   * @returns Promise that resolves when update is complete
   */
  async updateUserProfile(profile: Partial<KeycloakProfile>): Promise<void> {
    try {
      if (!this.isLoggedIn()) {
        throw new Error('User not logged in');
      }
      
      // TODO: backend user profile db
      // For now, redirect to Keycloak account management
      const accountUrl = this.keycloak.getKeycloakInstance().createAccountUrl();
      window.open(accountUrl, '_blank');
    } catch (error) {
      console.error('Error updating user profile', error);
      throw error;
    }
  }
}
