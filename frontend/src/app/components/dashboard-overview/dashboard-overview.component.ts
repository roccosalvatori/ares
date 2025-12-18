import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-dashboard-overview',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="dashboard-overview-container">
      <div class="dashboard-content">
        <div class="placeholder-message">
          <h1>Dashboard</h1>
          <p>Welcome to ARES Dashboard</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-overview-container {
      width: 100vw;
      height: 100vh;
      background: var(--bg-primary);
      display: flex;
      flex-direction: column;
      padding-top: 70px;
      box-sizing: border-box;
    }

    .dashboard-content {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
    }

    .placeholder-message {
      text-align: center;
      color: var(--text-primary);
    }

    .placeholder-message h1 {
      font-size: 2.5rem;
      font-weight: 600;
      font-family: 'Montserrat', sans-serif;
      margin-bottom: 16px;
      color: var(--text-primary);
    }

    .placeholder-message p {
      font-size: 1.2rem;
      color: var(--text-secondary);
      font-family: 'Montserrat', sans-serif;
    }
  `]
})
export class DashboardOverviewComponent {
}

