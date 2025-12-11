import { Routes } from '@angular/router';
import { MetricsDashboardComponent } from './features/health-metrics/ui/metrics-dashboard/metrics-dashboard.component';
import { AnalysisComponent } from './features/health-metrics/ui/analysis/analysis.component';
import { SettingsComponent } from './features/settings/settings.component';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { 
    path: 'dashboard', 
    component: MetricsDashboardComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'analysis', 
    component: AnalysisComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'settings', 
    component: SettingsComponent,
    canActivate: [authGuard]
  },
];
