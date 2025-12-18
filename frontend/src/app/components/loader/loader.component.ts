import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'scale(0.7)'
        }),
        animate('0.5s cubic-bezier(0.4, 0, 0.2, 1)', style({
          opacity: 1,
          transform: 'scale(1)'
        }))
      ]),
      transition(':leave', [
        style({
          opacity: 1,
          transform: 'scale(1)'
        }),
        animate('0.5s cubic-bezier(0.4, 0, 0.2, 1)', style({
          opacity: 0,
          transform: 'scale(0.7)'
        }))
      ])
    ])
  ],
  template: `
    <div class="loader-overlay" [@fadeInOut]>
      <div class="container">
        <div class="loader"></div>
      </div>
    </div>
  `,
  styles: [`
    .loader-overlay {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      background: transparent;
    }

    .container {
      width: 150px;
      height: 150px;
      border-radius: 100%;
      background: linear-gradient(165deg, rgba(255,255,255,1) 0%, rgb(220, 220, 220) 40%, rgb(170, 170, 170) 98%, rgb(10, 10, 10) 100%);
      position: relative;
    }

    .loader {
      position: relative;
      width: 100%;
      height: 100%;
    }

    .loader:before {
      position: absolute;
      content: '';
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border-radius: 100%;
      border-bottom: 0 solid #ffffff05;
      box-shadow: 
        0 -10px 20px 20px #ffffff40 inset,
        0 -5px 15px 10px #ffffff50 inset,
        0 -2px 5px #ffffff80 inset,
        0 -3px 2px #ffffffBB inset,
        0 2px 0px #ffffff,
        0 2px 3px #ffffff,
        0 5px 5px #ffffff90,
        0 10px 15px #ffffff60,
        0 10px 20px 20px #ffffff40;
      filter: blur(3px);
      animation: rotate 2s linear infinite;
    }

    @keyframes rotate {
      100% {
        transform: rotate(360deg);
      }
    }

    .light-mode .loader-overlay {
      background: rgba(255, 255, 255, 0.7);
    }
  `]
})
export class LoaderComponent {
}

