import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserDataExport {
  user: {
    id: string;
    email: string;
    registrationDate: string;
  };
  workouts: any[];
  measurements: any[];
}

@Injectable({
  providedIn: 'root',
})
export class UserApiService {
  private readonly apiUrl = `${environment.apiUrl}/users/me`;

  constructor(private http: HttpClient) {}

  /**
   * GDPR Article 20 - Right to Data Portability
   * Export all user data in JSON format
   */
  exportUserData(): Observable<UserDataExport> {
    return this.http.get<UserDataExport>(`${this.apiUrl}/data`);
  }

  /**
   * GDPR Article 17 - Right to Erasure ("Right to be Forgotten")
   * Delete user account and all associated data
   */
  deleteUserData(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/data`);
  }
}
