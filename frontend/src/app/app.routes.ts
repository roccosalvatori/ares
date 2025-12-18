import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardOverviewComponent } from './components/dashboard-overview/dashboard-overview.component';
import { ExecutionsComponent } from './components/executions/dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardOverviewComponent },
  { path: 'executions', component: ExecutionsComponent },
];

