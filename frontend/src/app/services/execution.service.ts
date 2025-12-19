import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

export interface ExecutionData {
  orderId: string;
  isin: string;
  bloombergLongTicker: string;
  trader: string;
  book: string;
  status: string;
  instrument: string;
  region: string;
  mic: string;
  executionId: number;
  quantity: number;
  price: number;
  notional: number;
  currency: string;
  side: string;
  orderType: string;
  timeInForce: string;
  isActive: boolean;
  exchange: string;
  settlementDate: string;
  tradeDate: string;
  executionTime: string;
  commission: number;
  account: string;
  strategy: string;
  counterparty: string;
  venue: string;
  orderStatus: string;
  fillQuantity: number;
  averagePrice: number;
  clientId: string;
  portfolio: string;
  sector: string;
  assetClass: string;
}

export interface TableColumn {
  field: string;
  header: string;
  type?: string;
}

export interface TableConfig {
  columns: TableColumn[];
}

export interface AllFieldsConfig {
  fields: TableColumn[];
}

@Injectable({
  providedIn: 'root'
})
export class ExecutionService {
  private apiUrl = 'http://localhost:8080/api';
  
  // Frontend cache for executions
  private executionsCache: Map<number, ExecutionData[]> = new Map();
  private cacheObservables: Map<number, Observable<ExecutionData[]>> = new Map();

  constructor(private http: HttpClient) {}

  getExecutions(count: number = 2000): Observable<ExecutionData[]> {
    // Check if we have cached data
    if (this.executionsCache.has(count)) {
      return of([...this.executionsCache.get(count)!]);
    }
    
    // Check if there's an ongoing request for this count
    if (this.cacheObservables.has(count)) {
      return this.cacheObservables.get(count)!;
    }
    
    // Create new request and cache it
    const request$ = this.http.get<ExecutionData[]>(`${this.apiUrl}/test-execution/list?count=${count}`).pipe(
      map(data => {
        // Cache the result
        this.executionsCache.set(count, [...data]);
        return data;
      }),
      shareReplay(1)
    );
    
    this.cacheObservables.set(count, request$);
    
    // Clean up observable cache after request completes
    request$.subscribe({
      complete: () => {
        // Keep the observable cached for a short time, but remove after 5 minutes
        setTimeout(() => {
          this.cacheObservables.delete(count);
        }, 5 * 60 * 1000);
      }
    });
    
    return request$;
  }
  
  clearCache(): void {
    this.executionsCache.clear();
    this.cacheObservables.clear();
  }

  getTableColumns(): Observable<TableConfig> {
    return this.http.get<TableConfig>('/assets/config/table-columns.json');
  }

  getAllFields(): Observable<AllFieldsConfig> {
    return this.http.get<AllFieldsConfig>('/assets/config/all-fields.json');
  }
}

