import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginTransitionService {
  private isTransitioningSubject = new BehaviorSubject<boolean>(false);
  public isTransitioning$: Observable<boolean> = this.isTransitioningSubject.asObservable();

  startTransition(): void {
    this.isTransitioningSubject.next(true);
  }

  endTransition(): void {
    this.isTransitioningSubject.next(false);
  }

  isTransitioning(): boolean {
    return this.isTransitioningSubject.value;
  }
}

