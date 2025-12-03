import { Routes } from '@angular/router';
import { MetricsDashboardComponent } from './features/health-metrics/ui/metrics-dashboard/metrics-dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: MetricsDashboardComponent },
];
