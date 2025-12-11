import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { KeycloakProfile } from 'keycloak-js';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  loading = signal(true);
  deleting = signal(false);
  profile = signal<KeycloakProfile | null>(null);
  error = signal<string | null>(null);
  success = signal<string | null>(null);


  ngOnInit(): void {
    this.loadProfile();
  }

  async loadProfile(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const profile = await this.authService.getUserProfile();
      if (profile) {
        this.profile.set(profile);
      }
    } catch (err) {
      this.error.set('Failed to load profile');
      console.error('Error loading profile:', err);
    } finally {
      this.loading.set(false);
    }
  }

  async deleteAllData(): Promise<void> {
    if (!confirm('Are you sure you want to delete all your data? This action cannot be undone.')) {
      return;
    }

    this.deleting.set(true);
    this.error.set(null);
    this.success.set(null);

    try {
      // TODO: Implement backend API endpoint to delete user data
      // This should:
      // 1. Delete all health metrics data
      // 2. Delete user preferences
      // 3. Optionally delete Keycloak account (or mark for deletion)
      console.log('Delete all data for user:', this.authService.getUserId());
      
      // Placeholder: Show success message
      this.success.set('Data deletion request submitted. You will be logged out.');
      
      // After deletion, log out user
      setTimeout(() => {
        this.authService.logout();
      }, 2000);
    } catch (err) {
      this.error.set('Failed to delete data. Please try again.');
      console.error('Error deleting data:', err);
    } finally {
      this.deleting.set(false);
    }
  }

  openKeycloakAccount(): void {
    // Open the Keycloak account page in a new tab
    const accountUrl = this.authService.getKeycloakAccountUrl
      ? this.authService.getKeycloakAccountUrl()
      : 'https://auth.example.com/realms/your-realm/account';
    window.open(accountUrl, '_blank');
  }
}
