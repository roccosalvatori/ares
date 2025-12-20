import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { EnvironmentService } from '../../services/environment.service';
import { DatasourceService } from '../../services/datasource.service';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { LiveFeedToggleComponent } from '../live-feed-toggle/live-feed-toggle.component';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, LiveFeedToggleComponent],
  template: `
    <nav class="navbar" [class.live-feed-active]="isLiveFeedActive">
      <div class="navbar-left">
        <div class="logo-container">
          <img [src]="isLightMode ? 'assets/svgs/logos/logo-ares-simple-dark.svg' : 'assets/svgs/logos/logo-ares-simple.svg'" alt="ARES Logo" class="logo-ares-simple">
        </div>
        <span class="environment-tag" [class.uat]="environment === 'UAT'" [class.bench]="environment === 'BENCH'" [class.prod]="environment === 'PROD'">
          {{ environment }}
        </span>
        <div class="datasource-indicator" 
             [class.connected]="isDatasourceAvailable" 
             [class.disconnected]="!isDatasourceAvailable"
             [class.expanded]="showServerAddress && isDatasourceAvailable"
             (mouseenter)="showServerAddress = true"
             (mouseleave)="showServerAddress = false">
          <span class="status-dot" [class.connected]="isDatasourceAvailable" [class.disconnected]="!isDatasourceAvailable"></span>
          <div class="status-text-wrapper">
            <span class="status-text">{{ isDatasourceAvailable ? 'Connected' : 'Unavailable' }}</span>
            <span class="server-address-expanded" *ngIf="showServerAddress && isDatasourceAvailable"> to {{ serverAddress }}</span>
            <svg class="computer-icon" *ngIf="showServerAddress && isDatasourceAvailable" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="4" width="20" height="12" rx="2" stroke="currentColor" stroke-width="2"/>
              <path d="M8 20h8M12 16v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
        </div>
      </div>
      <div class="navbar-right">
        <ul class="nav-links">
          <li class="live-feed-container-wrapper">
            <div class="live-feed-container">
              <span class="live-feed-label" [class.active]="isLiveFeedActive">
                <span class="live-feed-dot" *ngIf="isLiveFeedActive"></span>
                LIVE FEED
              </span>
              <app-live-feed-toggle [isActive]="isLiveFeedActive" (toggleChange)="onLiveFeedToggle($event)"></app-live-feed-toggle>
            </div>
          </li>
          <li><a routerLink="/dashboard" routerLinkActive="active">Dashboard</a></li>
          <li class="executions-link-container">
            <a routerLink="/executions" routerLinkActive="active">Executions</a>
          </li>
          <li><a routerLink="/reports" routerLinkActive="active">Reports</a></li>
          <li><a routerLink="/settings" routerLinkActive="active">Settings</a></li>
        </ul>
        <div class="profile-container">
          <div class="profile-actions" [class.visible]="showProfileActions" (mouseenter)="onProfileActionsEnter()" (mouseleave)="onProfileActionsLeave()">
            <button class="profile-action-btn" (click)="toggleLightMode()">
              <img [src]="isLightMode ? 'assets/svgs/icons/light-mode-dark.svg' : 'assets/svgs/icons/light-mode.svg'" alt="Theme Mode" class="btn-icon">
              <span>{{ isLightMode ? 'Dark Mode' : 'Light Mode' }}</span>
            </button>
            <button class="profile-action-btn logout-btn" (click)="logout()">
              <img src="assets/svgs/icons/logout.svg" alt="Logout" class="btn-icon">
              <span>Log out</span>
            </button>
          </div>
          <div class="profile-logo" (mouseenter)="onProfileLogoEnter()" (mouseleave)="onProfileLogoLeave()">
            <img [src]="isLightMode ? 'assets/svgs/icons/profile-dark.svg' : 'assets/svgs/icons/profile.svg'" alt="Profile" class="profile-icon">
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      width: 100%;
      height: 70px;
      background: var(--bg-primary);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      box-sizing: border-box;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
    }

    .navbar::after {
      content: '';
      position: absolute;
      bottom: -3px;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, 
        rgba(217, 64, 64, 0) 0%,
        rgba(217, 64, 64, 0.8) 20%,
        rgba(217, 64, 64, 1) 50%,
        rgba(217, 64, 64, 0.8) 80%,
        rgba(217, 64, 64, 0) 100%);
      box-shadow: 0 0 10px rgba(217, 64, 64, 0.6),
                  0 0 20px rgba(217, 64, 64, 0.4),
                  0 0 30px rgba(217, 64, 64, 0.2);
      opacity: 0;
      transform: scaleY(0);
      transition: opacity 0.5s ease-in-out, transform 0.5s ease-in-out;
      pointer-events: none;
    }

    .navbar.live-feed-active::after {
      opacity: 1;
      transform: scaleY(1);
      animation: redGlow 2s ease-in-out infinite;
    }

    @keyframes redGlow {
      0%, 100% {
        opacity: 1;
        box-shadow: 0 0 10px rgba(217, 64, 64, 0.6),
                    0 0 20px rgba(217, 64, 64, 0.4),
                    0 0 30px rgba(217, 64, 64, 0.2);
      }
      50% {
        opacity: 0.8;
        box-shadow: 0 0 15px rgba(217, 64, 64, 0.8),
                    0 0 30px rgba(217, 64, 64, 0.6),
                    0 0 45px rgba(217, 64, 64, 0.4);
      }
    }

    .navbar-left {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-shrink: 0;
    }

    .environment-tag {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 4px 12px;
      font-size: 0.75rem;
      font-weight: 600;
      border-radius: 4px;
      text-transform: uppercase;
      font-family: 'Montserrat', sans-serif;
      letter-spacing: 0.5px;
    }

    .environment-tag.uat {
      background-color: #22c55e;
      color: #000000;
    }

    .environment-tag.bench {
      background-color: #eab308;
      color: #000000;
    }

    .environment-tag.prod {
      background-color: #ef4444;
      color: #ffffff;
    }

    .datasource-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.75rem;
      font-weight: 500;
      font-family: 'Montserrat', sans-serif;
      cursor: pointer;
      position: relative;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: inline-block;
      flex-shrink: 0;
    }

    .status-dot.connected {
      background-color: #22c55e;
      animation: blink 1.5s ease-in-out infinite;
    }

    .status-dot.disconnected {
      background-color: #ef4444;
    }

    .status-text-wrapper {
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 8px;
      border-radius: 4px;
      border: 2px solid transparent;
      transition: all 0.3s ease;
    }

    .datasource-indicator.expanded .status-text-wrapper {
      background: var(--bg-secondary);
      border: 2px solid transparent;
      padding: 4px 8px;
    }

    .datasource-indicator.expanded .status-text-wrapper::before {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      border: 2px solid #22c55e;
      border-radius: 4px;
      opacity: 0;
      animation: borderReveal 0.6s ease-out forwards;
      clip-path: inset(0% 100% 100% 0%);
    }

    .status-text {
      font-size: 0.75rem;
      transition: color 0.3s ease;
      white-space: nowrap;
    }

    .server-address-expanded {
      font-size: 0.75rem;
      color: #22c55e;
      white-space: nowrap;
      opacity: 0;
      max-width: 0;
      overflow: hidden;
      transform: translateX(-10px);
      transition: opacity 0.4s ease-out, max-width 0.4s ease-out, transform 0.4s ease-out;
    }

    .datasource-indicator.expanded .server-address-expanded {
      opacity: 1;
      max-width: 150px;
      transform: translateX(0);
    }

    .computer-icon {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
      color: #22c55e;
      opacity: 0;
      max-width: 0;
      overflow: hidden;
      transform: translateX(-10px);
      transition: opacity 0.4s ease-out, max-width 0.4s ease-out, transform 0.4s ease-out;
    }

    .datasource-indicator.expanded .computer-icon {
      opacity: 1;
      max-width: 20px;
      transform: translateX(0);
    }

    @keyframes borderReveal {
      0% {
        clip-path: polygon(0% 0%, 0% 0%, 0% 0%, 0% 0%);
        opacity: 0;
      }
      25% {
        opacity: 1;
        clip-path: polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%);
      }
      50% {
        clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 100% 100%);
      }
      75% {
        clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
      }
      100% {
        clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
        opacity: 1;
      }
    }

    .datasource-indicator.connected .status-text {
      color: #22c55e !important;
    }

    .datasource-indicator.disconnected .status-text {
      color: #ef4444 !important;
    }

    @keyframes blink {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.3;
      }
    }


    .profile-logo {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      cursor: pointer;
      flex-shrink: 0;
      transition: opacity 0.3s ease;
      position: relative;
      z-index: 10;
    }

    .navbar-right:hover .profile-logo {
      opacity: 0.7;
    }

    .profile-icon {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .profile-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      opacity: 0;
      transform: translateX(20px);
      pointer-events: none;
      transition: opacity 0.3s ease, transform 0.3s ease;
    }

    .profile-actions.visible {
      opacity: 1;
      transform: translateX(0);
      pointer-events: all;
    }

    .profile-action-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: transparent;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      color: var(--text-primary);
      font-size: 0.85rem;
      font-weight: 500;
      font-family: 'Montserrat', sans-serif;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .profile-action-btn:hover {
      background: var(--bg-tertiary);
      border-color: var(--border-hover);
    }

    .profile-action-btn .btn-icon {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
      opacity: 0.8;
    }

    .profile-action-btn:hover .btn-icon {
      opacity: 1;
    }

    .profile-action-btn.logout-btn {
      color: #ef4444;
      border-color: #ef4444;
    }

    .profile-action-btn.logout-btn:hover {
      background: rgba(239, 68, 68, 0.15);
      border-color: #ef4444;
    }

    .profile-action-btn.logout-btn .btn-icon {
      filter: brightness(0) saturate(100%) invert(27%) sepia(95%) saturate(1352%) hue-rotate(340deg) brightness(97%) contrast(92%);
    }

    .logo-container {
      display: flex;
      align-items: center;
      height: 40px;
    }

    .logo-ares-simple {
      height: 40%;
      width: auto;
      object-fit: contain;
    }

    .navbar-right {
      display: flex;
      align-items: center;
      margin-left: auto;
      position: relative;
    }

    .nav-links {
      transition: transform 0.3s ease;
    }

    .profile-container:has(.profile-logo:hover) .profile-actions,
    .profile-actions:hover {
      opacity: 1;
      transform: translateX(0);
      pointer-events: all;
    }

    .profile-container:has(.profile-logo:hover) ~ .nav-links {
      transform: translateX(-180px);
    }

    .profile-actions.visible {
      opacity: 1;
      transform: translateX(0);
      pointer-events: all;
    }

    .profile-container {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-left: 50px;
      position: relative;
      flex-shrink: 0;
    }

    .nav-links {
      display: flex;
      list-style: none;
      margin: 0;
      padding: 0;
      gap: 32px;
      align-items: center;
    }

    .nav-links li {
      margin: 0;
    }

    .nav-links a {
      color: var(--text-primary);
      text-decoration: none;
      font-size: 0.95rem;
      font-weight: 500;
      padding: 8px 0;
      transition: color 0.3s ease;
      position: relative;
      font-family: 'Montserrat', sans-serif;
    }

    .nav-links a:hover {
      color: var(--text-secondary);
    }

    .nav-links a.active {
      color: var(--text-primary);
      font-weight: 600;
    }

    .nav-links a.active::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background: var(--text-primary);
    }

    .executions-link-container {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .live-feed-container-wrapper {
      display: flex;
      align-items: center;
    }

    .live-feed-container {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-right: 32px;
    }

    .live-feed-label {
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-family: 'Montserrat', sans-serif;
      display: flex;
      align-items: center;
      gap: 6px;
      margin-right: 10px;
      transition: color 0.3s ease;
    }

    .live-feed-label.active {
      color: rgb(217, 64, 64);
    }

    .live-feed-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: rgb(217, 64, 64);
      display: inline-block;
      animation: pulse 1s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.6;
        transform: scale(1.2);
      }
    }


    @media (max-width: 768px) {
      .navbar {
        padding: 0 20px;
        height: 60px;
      }

      .navbar-left {
        gap: 16px;
      }

      .profile-container:hover ~ .nav-links {
        transform: translateX(-140px);
      }

      .profile-container {
        margin-left: 20px;
      }

      .profile-logo {
        width: 32px;
        height: 32px;
      }

      .profile-action-btn {
        padding: 6px 12px;
        font-size: 0.75rem;
      }

      .profile-action-btn .btn-icon {
        width: 14px;
        height: 14px;
      }

      .logo-container {
        height: 32px;
      }

      .nav-links {
        gap: 20px;
      }

      .nav-links a {
        font-size: 0.85rem;
      }
    }
  `]
})
export class NavbarComponent implements OnInit, OnDestroy {
  environment: string = 'UAT';
  isDatasourceAvailable: boolean = false;
  showProfileActions: boolean = false;
  isLightMode: boolean = false;
  showServerAddress: boolean = false;
  serverAddress: string = '8.8.8.8';
  firstName: string = 'User'; // Template first name - will be replaced with actual user data later
  isExecutionsRoute: boolean = false;
  isLiveFeedActive: boolean = false;
  private datasourceSubscription?: Subscription;
  private themeSubscription?: Subscription;
  private hideProfileActionsTimeout?: any;
  private routerSubscription?: Subscription;

  constructor(
    private environmentService: EnvironmentService,
    private datasourceService: DatasourceService,
    private authService: AuthService,
    private router: Router,
    private themeService: ThemeService
  ) {
    this.environment = this.environmentService.getEnvironment();
  }

  ngOnInit(): void {
    // Check initial route
    this.updateExecutionsRoute(this.router.url);

    // Subscribe to route changes
    this.routerSubscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.updateExecutionsRoute(event.urlAfterRedirects);
      });

    this.datasourceSubscription = this.datasourceService.isAvailable$.subscribe(
      isAvailable => {
        this.isDatasourceAvailable = isAvailable;
      }
    );
    
    // Subscribe to theme changes
    this.isLightMode = this.themeService.isLightMode();
    this.themeSubscription = this.themeService.isLightMode$.subscribe(
      isLight => {
        this.isLightMode = isLight;
      }
    );
  }

  private updateExecutionsRoute(url: string): void {
    this.isExecutionsRoute = url === '/executions' || url.startsWith('/executions');
  }

  onLiveFeedToggle(isActive: boolean): void {
    this.isLiveFeedActive = isActive;
    // TODO: Implement live feed logic
  }

  ngOnDestroy(): void {
    if (this.datasourceSubscription) {
      this.datasourceSubscription.unsubscribe();
    }
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    this.clearHideTimeout();
  }

  onProfileLogoEnter(): void {
    this.clearHideTimeout();
    this.showProfileActions = true;
  }

  onProfileLogoLeave(): void {
    this.scheduleHideProfileActions();
  }

  onProfileActionsEnter(): void {
    this.clearHideTimeout();
    this.showProfileActions = true;
  }

  onProfileActionsLeave(): void {
    this.scheduleHideProfileActions();
  }

  private scheduleHideProfileActions(): void {
    this.clearHideTimeout();
    this.hideProfileActionsTimeout = setTimeout(() => {
      this.showProfileActions = false;
    }, 500); // 500ms delay before hiding
  }

  private clearHideTimeout(): void {
    if (this.hideProfileActionsTimeout) {
      clearTimeout(this.hideProfileActionsTimeout);
      this.hideProfileActionsTimeout = undefined;
    }
  }

  toggleLightMode(): void {
    this.themeService.toggleTheme();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

