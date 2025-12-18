import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private micValuesCache: string[] | null = null;

  constructor(private http: HttpClient) {}

  getMicValues(): Observable<string[]> {
    if (this.micValuesCache) {
      return new Observable(observer => {
        observer.next(this.micValuesCache!);
        observer.complete();
      });
    }

    return new Observable(observer => {
      this.http.get<string[]>('/assets/config/mic-values.json').subscribe({
        next: (values) => {
          this.micValuesCache = values;
          observer.next(values);
          observer.complete();
        },
        error: (error) => {
          console.error('Error loading MIC values:', error);
          observer.next([]);
          observer.complete();
        }
      });
    });
  }
}

