import { Injectable, inject } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { UserProfile } from '../models/user.models';

@Injectable({
  providedIn: 'root',
})
export class UserProfileService {
  private readonly authService = inject(AuthService);

  /**
   * Get the user's profile including calculated age
   */
  getUserProfile(): Observable<UserProfile | null> {
    return from(this.authService.getUserProfile()).pipe(
      map((keycloakProfile) => {
        if (!keycloakProfile) return null;

        const userProfile: UserProfile = {
          id: keycloakProfile.id,
          username: keycloakProfile.username,
          email: keycloakProfile.email,
          firstName: keycloakProfile.firstName,
          lastName: keycloakProfile.lastName,
        };

        // Calculate age from birthdate if available
        if (keycloakProfile.attributes?.['birthdate']) {
          const birthdate = Array.isArray(keycloakProfile.attributes['birthdate'])
            ? keycloakProfile.attributes['birthdate'][0]
            : keycloakProfile.attributes['birthdate'];
          userProfile.birthDate = birthdate;
          userProfile.age = this.calculateAge(birthdate);
        }

        return userProfile;
      }),
      catchError((error) => {
        console.error('Error fetching user profile', error);
        return of(null);
      })
    );
  }

  /**
   * Get the user's age
   * Returns null if age cannot be determined
   */
  getUserAge(): Observable<number | null> {
    return this.getUserProfile().pipe(map((profile) => profile?.age ?? null));
  }

  /**
   * Calculate age from birthdate string (ISO format YYYY-MM-DD)
   */
  private calculateAge(birthdate: string): number {
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    // Adjust age if birthday hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }
}
