import { Injectable, inject } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { UserProfile } from '../models/user.models';

const MIN_AGE = 0;
const MAX_AGE = 150;

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
          const birthdateAttr = keycloakProfile.attributes['birthdate'];
          // Handle both array and string formats; take first value if array
          const birthdate = Array.isArray(birthdateAttr) ? birthdateAttr[0] : birthdateAttr;
          
          if (birthdate) {
            userProfile.birthDate = birthdate;
            const calculatedAge = this.calculateAge(birthdate);
            if (calculatedAge !== null) {
              userProfile.age = calculatedAge;
            }
          }
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
   * Returns null if the birthdate is invalid
   */
  private calculateAge(birthdate: string): number | null {
    if (!birthdate || typeof birthdate !== 'string') {
      return null;
    }

    const birthDate = new Date(birthdate);

    // Check if the date is valid
    if (isNaN(birthDate.getTime())) {
      console.warn('Invalid birthdate format:', birthdate);
      return null;
    }

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    // Adjust age if birthday hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // Additional validation: age should be reasonable
    if (age < MIN_AGE || age > MAX_AGE) {
      console.warn('Calculated age is out of reasonable range:', age);
      return null;
    }

    return age;
  }
}
