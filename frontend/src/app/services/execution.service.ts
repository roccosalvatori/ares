import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  constructor(private http: HttpClient) {}

  getExecutions(count: number = 10): Observable<ExecutionData[]> {
    return this.http.get<ExecutionData[]>(`${this.apiUrl}/test-execution/list?count=${count}`);
  }

  getTableColumns(): Observable<TableConfig> {
    return this.http.get<TableConfig>('/assets/config/table-columns.json');
  }

  getAllFields(): Observable<AllFieldsConfig> {
    return this.http.get<AllFieldsConfig>('/assets/config/all-fields.json');
  }
}

