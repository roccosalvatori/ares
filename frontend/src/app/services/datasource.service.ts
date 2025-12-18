import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, BehaviorSubject } from 'rxjs';
import { catchError, timeout, map } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DatasourceService {
  private apiUrl = 'http://localhost:8080/api';
  private checkInterval = 5000; // Check every 5 seconds
  private isAvailableSubject = new BehaviorSubject<boolean>(false);
  public isAvailable$ = this.isAvailableSubject.asObservable();

  constructor(private http: HttpClient) {
    // Start periodic checks
    this.startPingCheck();
  }

  private startPingCheck(): void {
    // Check immediately
    this.checkAvailability();

    // Then check periodically
    interval(this.checkInterval).subscribe(() => {
      this.checkAvailability();
    });
  }

  private checkAvailability(): void {
    // Call backend endpoint to ping 8.8.8.8
    this.http.get<{ available: boolean }>(`${this.apiUrl}/datasource/ping`)
      .pipe(
        timeout(3000), // 3 second timeout
        catchError(() => {
          return of({ available: false });
        })
      )
      .subscribe(response => {
        this.isAvailableSubject.next(response.available);
      });
  }

  // Public method to manually check availability
  checkAvailabilityNow(): Observable<boolean> {
    return this.http.get<{ available: boolean }>(`${this.apiUrl}/datasource/ping`)
      .pipe(
        timeout(3000),
        map(response => response.available),
        catchError(() => of(false))
      );
  }
}

