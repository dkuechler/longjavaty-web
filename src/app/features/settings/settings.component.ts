import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { UserApiService } from '../../core/services/user-api.service';
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
  private readonly userApiService = inject(UserApiService);
  private readonly fb = inject(FormBuilder);

  loading = signal(true);
  deleting = signal(false);
  exporting = signal(false);
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
      await this.userApiService.deleteUserData().toPromise();
      this.success.set('All your data has been deleted. Logging out...');
      
      // Log out after successful deletion
      setTimeout(() => {
        this.authService.logout();
      }, 1500);
    } catch (err) {
      this.error.set('Failed to delete data. Please try again.');
      console.error('Error deleting data:', err);
    } finally {
      this.deleting.set(false);
    }
  }

  async exportData(): Promise<void> {
    this.exporting.set(true);
    this.error.set(null);
    this.success.set(null);

    try {
      const data = await this.userApiService.exportUserData().toPromise();
      
      // Create downloadable JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `health-data-export-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      this.success.set('Data exported successfully!');
    } catch (err) {
      this.error.set('Failed to export data. Please try again.');
      console.error('Error exporting data:', err);
    } finally {
      this.exporting.set(false);
    }
  }

  openKeycloakAccount(): void {
    this.authService.updateUserProfile();
  }

  logout(): void {
    this.authService.logout();
  }
}
