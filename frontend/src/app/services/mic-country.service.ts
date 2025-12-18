import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MicCountryService {
  private micToCountryMap$: Observable<Map<string, string>> | null = null;

  constructor(private http: HttpClient) {}

  /**
   * Loads the MIC codes CSV and creates a mapping from MIC code to ISO country code
   */
  private loadMicToCountryMap(): Observable<Map<string, string>> {
    if (!this.micToCountryMap$) {
      this.micToCountryMap$ = this.http.get('/assets/config/static-data/mic-codes.csv', { responseType: 'text' })
        .pipe(
          map(csvText => {
            const map = new Map<string, string>();
            const lines = csvText.split('\n');
            
            // Skip header line
            for (let i = 1; i < lines.length; i++) {
              const line = lines[i].trim();
              if (!line) continue;
              
              // Parse CSV line (handling quoted fields)
              const columns = this.parseCsvLine(line);
              if (columns.length >= 9) {
                const mic = columns[0]?.trim().toUpperCase();
                const countryCode = columns[8]?.trim().toLowerCase(); // ISO COUNTRY CODE is column 9 (index 8)
                
                if (mic && countryCode) {
                  map.set(mic, countryCode);
                }
              }
            }
            
            return map;
          }),
          shareReplay(1)
        );
    }
    
    return this.micToCountryMap$;
  }

  /**
   * Parse a CSV line handling quoted fields
   */
  private parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    
    return result;
  }

  /**
   * Get the country code for a given MIC code
   */
  getCountryCode(mic: string): Observable<string | null> {
    return this.loadMicToCountryMap().pipe(
      map(map => {
        const upperMic = mic?.trim().toUpperCase();
        return map.get(upperMic) || null;
      })
    );
  }

  /**
   * Get the flag SVG path for a country code
   */
  getFlagPath(countryCode: string | null): string | null {
    if (!countryCode) return null;
    const lowerCode = countryCode.toLowerCase();
    return `/assets/svgs/illustrations/flags/${lowerCode}.svg`;
  }
}

