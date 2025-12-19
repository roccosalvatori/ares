import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { LoginTransitionService } from './services/login-transition.service';
import { LoaderComponent } from './components/loader/loader.component';
import { ThemeService } from './services/theme.service';
import { Subscription } from 'rxjs';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, LoaderComponent],
  animations: [
    trigger('slideIn', [
      state('hidden', style({
        transform: 'translateX(-100%)'
      })),
      state('visible', style({
        transform: 'translateX(0%)'
      })),
      transition('hidden => visible', animate('0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)')),
      transition('visible => hidden', animate('0s')) // No slide on exit, just fade
    ]),
    trigger('fadeIn', [
      state('hidden', style({
        opacity: 0
      })),
      state('visible', style({
        opacity: 1
      })),
      transition('hidden => visible', animate('0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)')),
      transition('visible => hidden', animate('0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)'))
    ]),
    trigger('loaderFade', [
      state('visible', style({
        opacity: 1
      })),
      state('hidden', style({
        opacity: 0
      })),
      transition('visible => hidden', animate('0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)'))
    ]),
    trigger('logoFade', [
      state('hidden', style({
        opacity: 0
      })),
      state('visible', style({
        opacity: 1
      })),
      transition('hidden => visible', animate('0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)')),
      transition('visible => hidden', animate('0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)'))
    ])
  ],
  template: `
    <div class="background-section" *ngIf="showBackground"></div>
    <router-outlet [class.full-width]="!showBackground"></router-outlet>
    
    <!-- Login Transition Overlay -->
    <div class="login-transition-overlay" 
         *ngIf="isTransitioning"
         [@slideIn]="transitionState"
         [@fadeIn]="transitionState">
      <div class="transition-loader-container" *ngIf="showLoader" [@loaderFade]="loaderState">
        <app-loader></app-loader>
      </div>
      <div class="transition-logo-container" *ngIf="showLogo" [@logoFade]="logoState">
        <img [src]="logoPath" alt="ARES Logo" class="ares-logo-transition">
      </div>
    </div>
  `,
  styles: [`
    :host {
      width: 100%;
      height: 100vh;
      display: flex;
      overflow: hidden;
    }
    .background-section {
      width: 66.67%;
      height: 100vh;
      background-image: url('/assets/images/backgrounds/background.jpeg');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      flex-shrink: 0;
    }
    router-outlet {
      display: block;
      flex: 1;
      width: 33.33%;
    }
    router-outlet.full-width {
      width: 100% !important;
      flex: 0 0 100% !important;
      max-width: 100% !important;
      min-width: 100% !important;
    }
    router-outlet + * {
      width: 100%;
      height: 100%;
      display: block;
    }
    router-outlet.full-width + * {
      width: 100% !important;
      max-width: 100% !important;
      min-width: 100% !important;
    }

    .login-transition-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: #000000;
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .transition-loader-container {
      width: 180px;
      height: 180px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .transition-loader-container ::ng-deep .loader-overlay {
      width: 100%;
      height: 100%;
    }

    .transition-loader-container ::ng-deep .container {
      width: 180px;
      height: 180px;
    }

    .transition-logo-container {
      position: absolute;
      width: 200px;
      height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .ares-logo-transition {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    @media (max-width: 768px) {
      :host {
        flex-direction: column;
      }
      .background-section {
        width: 100%;
        height: 50%;
      }
      router-outlet {
        width: 100%;
        height: 50%;
      }
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'ARES';
  showBackground = true;
  isTransitioning = false;
  transitionState: 'hidden' | 'visible' = 'hidden';
  showLoader = true;
  showLogo = false;
  loaderState: 'visible' | 'hidden' = 'visible';
  logoState: 'visible' | 'hidden' = 'hidden';
  logoPath = 'assets/svgs/logos/logo-ares-simple.svg';
  private transitionSubscription?: Subscription;
  private themeSubscription?: Subscription;

  constructor(
    private router: Router,
    private loginTransitionService: LoginTransitionService,
    private themeService: ThemeService
  ) {
    // Set initial logo path based on theme
    this.logoPath = this.themeService.isLightMode() 
      ? 'assets/svgs/logos/logo-ares-simple-dark.svg' 
      : 'assets/svgs/logos/logo-ares-simple.svg';
  }

  ngOnInit() {
    // Check initial route
    this.updateBackgroundVisibility(this.router.url);
    
    // Listen to route changes
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.updateBackgroundVisibility(event.url);
      });

    // Subscribe to theme changes to update logo
    this.themeSubscription = this.themeService.isLightMode$.subscribe(
      isLight => {
        this.logoPath = isLight 
          ? 'assets/svgs/logos/logo-ares-simple-dark.svg' 
          : 'assets/svgs/logos/logo-ares-simple.svg';
      }
    );

    // Subscribe to transition state
    this.transitionSubscription = this.loginTransitionService.isTransitioning$.subscribe(
      isTransitioning => {
        if (isTransitioning) {
          this.isTransitioning = true;
          this.transitionState = 'visible';
          this.showLoader = true;
          this.showLogo = false;
          this.loaderState = 'visible';
          this.logoState = 'hidden';
          
          // Stage 1: Show loader for 2 seconds
          // Stage 2: Fade out loader (0.8s)
          setTimeout(() => {
            this.loaderState = 'hidden';
            
            // Stage 3: Show logo and fade in (0.8s)
            setTimeout(() => {
              this.showLoader = false;
              this.showLogo = true;
              this.logoState = 'visible';
              
              // Stage 4: Keep logo visible for 1 second, then fade out (0.8s)
              setTimeout(() => {
                this.logoState = 'hidden';
                
                // Stage 5: Fade out overlay to reveal page (0.8s)
                setTimeout(() => {
                  this.transitionState = 'hidden';
                  setTimeout(() => {
                    this.isTransitioning = false;
                    this.showLogo = false;
                    this.loginTransitionService.endTransition();
                  }, 800); // Wait for overlay fade-out animation
                }, 800); // Wait for logo fade-out animation
              }, 1000); // Logo visible duration
            }, 800); // Wait for loader fade-out animation
          }, 2000); // Loader visible duration
        }
      }
    );
  }

  ngOnDestroy(): void {
    if (this.transitionSubscription) {
      this.transitionSubscription.unsubscribe();
    }
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  private updateBackgroundVisibility(url: string): void {
    this.showBackground = url === '/login' || url === '/';
  }
}

