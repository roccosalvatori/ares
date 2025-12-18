import { Injectable } from '@angular/core';

export type Environment = 'UAT' | 'BENCH' | 'PROD';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {
  private currentEnvironment: Environment = 'UAT';

  constructor() {
    // You can set the environment from localStorage, environment variables, or API
    const envFromStorage = localStorage.getItem('environment') as Environment;
    if (envFromStorage && ['UAT', 'BENCH', 'PROD'].includes(envFromStorage)) {
      this.currentEnvironment = envFromStorage;
    }
  }

  getEnvironment(): Environment {
    return this.currentEnvironment;
  }

  setEnvironment(env: Environment): void {
    if (['UAT', 'BENCH', 'PROD'].includes(env)) {
      this.currentEnvironment = env;
      localStorage.setItem('environment', env);
    }
  }
}

