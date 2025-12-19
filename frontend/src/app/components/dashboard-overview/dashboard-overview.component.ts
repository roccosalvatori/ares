import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { ExecutionService, ExecutionData } from '../../services/execution.service';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard-overview',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  encapsulation: ViewEncapsulation.None,
  template: `
    <app-navbar></app-navbar>
    <div class="dashboard-container">
      <div class="dashboard-content">
        <!-- Stats Row - Digit Only Boxes -->
        <div class="stats-row">
          <div class="bento-card stats-card ack-executions">
            <div class="card-content">
              <div class="card-label">ACK</div>
              <div class="card-value ack-value">{{ ackExecutions | number }}</div>
            </div>
          </div>

          <div class="bento-card stats-card non-ack-executions">
            <div class="card-content">
              <div class="card-label">Non-ACK</div>
              <div class="card-value non-ack-value">{{ nonAckExecutions | number }}</div>
            </div>
          </div>

          <div class="bento-card stats-card proportion-card">
            <div class="card-content">
              <div class="card-label">Status Distribution</div>
              <div class="proportion-bar">
                <div class="proportion-segment ack-segment" [style.width.%]="getAckPercentage()" [style.left]="'0'"></div>
                <div class="proportion-segment non-ack-segment" [style.width.%]="getNonAckPercentage()" [style.left.%]="getAckPercentage()"></div>
              </div>
              <div class="proportion-labels">
                <span class="proportion-label ack-label">{{ getAckPercentage().toFixed(1) }}% ACK</span>
                <span class="proportion-label non-ack-label">{{ getNonAckPercentage().toFixed(1) }}% Non-ACK</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Hourly Execution Chart - Full Width -->
        <div class="bento-card chart-card hourly-chart-card">
          <div class="chart-header">
            <h3>Executions Throughout the Day</h3>
          </div>
          <div class="chart-container">
            <canvas #hourlyChart></canvas>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="bento-grid">
          <!-- Donut Chart - Instrument Type -->
          <div class="bento-card chart-card donut-chart-card">
            <div class="chart-header">
              <h3>Instrument Distribution</h3>
            </div>
            <div class="chart-container">
              <canvas #donutChart></canvas>
            </div>
          </div>

          <!-- Histogram - MIC Distribution -->
          <div class="bento-card chart-card histogram-card">
            <div class="chart-header">
              <h3>MIC Distribution</h3>
            </div>
            <div class="chart-container">
              <canvas #histogramChart></canvas>
            </div>
          </div>

          <!-- Horizontal Bar Chart - ISIN Distribution -->
          <div class="bento-card chart-card bar-chart-card">
            <div class="chart-header">
              <h3>Top ISINs by Execution Count</h3>
            </div>
            <div class="chart-container">
              <canvas #barChart></canvas>
            </div>
          </div>

          <!-- Status Distribution Chart -->
          <div class="bento-card chart-card status-chart-card">
            <div class="chart-header">
              <h3>Status Distribution</h3>
            </div>
            <div class="chart-container">
              <canvas #statusChart></canvas>
            </div>
          </div>

          <!-- Side Distribution Chart -->
          <div class="bento-card chart-card side-chart-card">
            <div class="chart-header">
              <h3>Side Distribution (BUY/SELL)</h3>
            </div>
            <div class="chart-container">
              <canvas #sideChart></canvas>
            </div>
          </div>

          <!-- Top Traders Chart -->
          <div class="bento-card chart-card traders-chart-card">
            <div class="chart-header">
              <h3>Top Traders by Execution Count</h3>
            </div>
            <div class="chart-container">
              <canvas #tradersChart></canvas>
            </div>
          </div>

          <!-- Region Distribution Chart -->
          <div class="bento-card chart-card region-chart-card">
            <div class="chart-header">
              <h3>Region Distribution</h3>
            </div>
            <div class="chart-container">
              <canvas #regionChart></canvas>
            </div>
          </div>

          <!-- Order Type Distribution Chart -->
          <div class="bento-card chart-card order-type-chart-card">
            <div class="chart-header">
              <h3>Order Type Distribution</h3>
            </div>
            <div class="chart-container">
              <canvas #orderTypeChart></canvas>
            </div>
          </div>

          <!-- Currency Distribution Chart -->
          <div class="bento-card chart-card currency-chart-card">
            <div class="chart-header">
              <h3>Currency Distribution</h3>
            </div>
            <div class="chart-container">
              <canvas #currencyChart></canvas>
            </div>
          </div>

          <!-- Top Books Chart -->
          <div class="bento-card chart-card books-chart-card">
            <div class="chart-header">
              <h3>Top Books by Execution Count</h3>
            </div>
            <div class="chart-container">
              <canvas #booksChart></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    app-dashboard-overview {
      display: block !important;
      width: 100vw !important;
      height: 100vh !important;
      max-width: 100vw !important;
      min-width: 100vw !important;
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    
    :host {
      display: block !important;
      width: 100vw !important;
      height: 100vh !important;
      max-width: 100vw !important;
      min-width: 100vw !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    
    .dashboard-container {
      width: 100vw !important;
      min-width: 100vw !important;
      max-width: 100vw !important;
      height: 100vh;
      background: var(--bg-primary);
      display: flex;
      flex-direction: column;
      padding-top: 70px;
      box-sizing: border-box;
      position: relative;
      margin: 0 !important;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .dashboard-content {
      width: 100%;
      padding: 20px;
      box-sizing: border-box;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
      max-width: 1600px;
      margin: 0 auto;
      width: 100%;
    }

    .bento-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
      max-width: 1600px;
      margin: 0 auto;
      width: 100%;
    }

    .bento-card {
      background-color: #0f0f0f;
      border: 1px solid #1a1a1a;
      border-radius: 12px;
      padding: 16px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      display: block;
    }

    .bento-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      border-color: #2a2a2a;
    }

    /* Stats Cards */
    .stats-card {
      display: flex;
      align-items: center;
      padding: 8px 12px !important;
      height: 60px;
      min-height: 60px;
    }

    .stats-card.ack-executions,
    .stats-card.non-ack-executions {
      height: 60px;
      min-height: 60px;
      padding: 8px 12px !important;
    }

    .stats-card.ack-executions .card-value {
      color: #22c55e;
    }

    .stats-card.non-ack-executions .card-value {
      color: #ef4444;
    }

    .card-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .card-label {
      font-size: 0.65rem;
      font-weight: 500;
      color: #999999;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-family: 'Montserrat', sans-serif;
      line-height: 1.2;
    }

    .card-value {
      font-size: 1.25rem;
      font-weight: 700;
      color: #ffffff;
      font-family: 'Montserrat', sans-serif;
      line-height: 1;
    }

    .card-value.ack-value {
      color: #22c55e;
    }

    .card-value.non-ack-value {
      color: #ef4444;
    }

    /* Proportion Card */
    .proportion-card {
      height: 60px;
      min-height: 60px;
      padding: 8px 12px !important;
    }

    .proportion-bar {
      width: 100%;
      height: 6px;
      background-color: #1a1a1a;
      border-radius: 3px;
      overflow: hidden;
      margin-top: 4px;
      position: relative;
    }

    .proportion-segment {
      height: 100%;
      position: absolute;
      top: 0;
      transition: width 0.3s ease, left 0.3s ease;
    }

    .proportion-segment.ack-segment {
      background-color: #22c55e;
    }

    .proportion-segment.non-ack-segment {
      background-color: #ef4444;
    }

    .proportion-labels {
      display: flex;
      justify-content: space-between;
      margin-top: 4px;
      font-size: 0.6rem;
      font-family: 'Montserrat', sans-serif;
    }

    .proportion-label {
      font-weight: 500;
    }

    .proportion-label.ack-label {
      color: #22c55e;
    }

    .proportion-label.non-ack-label {
      color: #ef4444;
    }

    /* Chart Cards */
    .chart-card {
      min-height: 200px;
      display: flex;
      flex-direction: column;
    }

    .chart-card.donut-chart-card,
    .chart-card.status-chart-card,
    .chart-card.region-chart-card {
      grid-column: span 1;
    }

    .chart-card.histogram-card,
    .chart-card.bar-chart-card,
    .chart-card.side-chart-card,
    .chart-card.traders-chart-card,
    .chart-card.order-type-chart-card,
    .chart-card.currency-chart-card,
    .chart-card.books-chart-card {
      grid-column: span 1;
    }

    .chart-card.hourly-chart-card {
      grid-column: 1 / -1;
      width: 100%;
      max-width: 100%;
      height: 250px;
      padding: 4px 12px !important;
    }

    .chart-card.hourly-chart-card .chart-header {
      margin-bottom: 2px;
    }

    .chart-card.hourly-chart-card .chart-header h3 {
      font-size: 0.65rem;
    }

    .chart-card.hourly-chart-card .chart-container {
      min-height: 40px;
    }

    .chart-header {
      margin-bottom: 8px;
    }

    .chart-header h3 {
      font-size: 0.8rem;
      font-weight: 600;
      color: #ffffff;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-family: 'Montserrat', sans-serif;
      margin: 0;
    }

    .chart-container {
      flex: 1;
      position: relative;
      min-height: 160px;
      width: 100%;
    }

    .chart-container canvas {
      max-height: 100%;
      width: 100% !important;
      height: auto !important;
      display: block;
    }

    /* Responsive Design */
    @media (max-width: 1200px) {
      .chart-card.histogram-card,
      .chart-card.bar-chart-card {
        grid-column: span 1;
      }
    }

    @media (max-width: 768px) {
      .dashboard-content {
        padding: 16px;
        gap: 16px;
      }

      .stats-row {
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 12px;
      }

      .bento-grid {
        grid-template-columns: 1fr;
        gap: 12px;
      }

      .bento-card {
        padding: 14px;
      }

      .stats-card.ack-executions,
      .stats-card.non-ack-executions {
        padding: 6px 10px !important;
      }

      .stats-card {
        height: 55px;
        min-height: 55px;
      }

      .proportion-card {
        height: 55px;
        min-height: 55px;
      }

      .card-value {
        font-size: 1.5rem;
      }

      .chart-card {
        min-height: 180px;
      }

      .chart-container {
        min-height: 140px;
      }
    }

    @media (max-width: 480px) {
      .dashboard-content {
        padding: 12px;
        gap: 12px;
      }

      .stats-row {
        grid-template-columns: 1fr;
        gap: 10px;
      }

      .bento-card {
        padding: 12px;
      }

      .stats-card {
        height: 50px;
        min-height: 50px;
      }

      .proportion-card {
        height: 50px;
        min-height: 50px;
      }

      .stats-card.ack-executions,
      .stats-card.non-ack-executions {
        padding: 6px 8px !important;
      }

      .card-value {
        font-size: 1.25rem;
      }

      .chart-card {
        min-height: 160px;
      }

      .chart-container {
        min-height: 120px;
      }
    }
  `]
})
export class DashboardOverviewComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('donutChart') donutChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('histogramChart') histogramChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barChart') barChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('statusChart') statusChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('sideChart') sideChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('tradersChart') tradersChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('regionChart') regionChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('orderTypeChart') orderTypeChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('currencyChart') currencyChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('booksChart') booksChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('hourlyChart') hourlyChartRef!: ElementRef<HTMLCanvasElement>;

  executions: ExecutionData[] = [];
  totalExecutions: number = 0;
  ackExecutions: number = 0;
  nonAckExecutions: number = 0;

  private donutChart: Chart | null = null;
  private histogramChart: Chart | null = null;
  private barChart: Chart | null = null;
  private statusChart: Chart | null = null;
  private sideChart: Chart | null = null;
  private tradersChart: Chart | null = null;
  private regionChart: Chart | null = null;
  private orderTypeChart: Chart | null = null;
  private currencyChart: Chart | null = null;
  private booksChart: Chart | null = null;
  private hourlyChart: Chart | null = null;

  constructor(
    private executionService: ExecutionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadExecutions();
  }

  ngAfterViewInit(): void {
    // Charts will be initialized after data loads
  }

  ngOnDestroy(): void {
    if (this.donutChart) this.donutChart.destroy();
    if (this.histogramChart) this.histogramChart.destroy();
    if (this.barChart) this.barChart.destroy();
    if (this.statusChart) this.statusChart.destroy();
    if (this.sideChart) this.sideChart.destroy();
    if (this.tradersChart) this.tradersChart.destroy();
    if (this.regionChart) this.regionChart.destroy();
    if (this.orderTypeChart) this.orderTypeChart.destroy();
    if (this.currencyChart) this.currencyChart.destroy();
    if (this.booksChart) this.booksChart.destroy();
    if (this.hourlyChart) this.hourlyChart.destroy();
  }

  loadExecutions(): void {
    this.executionService.getExecutions(2000).subscribe({
      next: (data) => {
        this.executions = data || [];
        this.calculateStats();
        this.cdr.detectChanges();
        setTimeout(() => {
          this.initializeCharts();
        }, 500);
      },
      error: (error) => {
        console.error('Dashboard: Error loading executions:', error);
        this.executions = [];
        this.calculateStats();
        this.cdr.detectChanges();
      }
    });
  }

  calculateStats(): void {
    this.totalExecutions = this.executions.length;
    this.ackExecutions = this.executions.filter(e => e.status === 'ACK').length;
    this.nonAckExecutions = this.executions.filter(e => e.status !== 'ACK').length;
  }

  getAckPercentage(): number {
    if (this.totalExecutions === 0) return 0;
    return (this.ackExecutions / this.totalExecutions) * 100;
  }

  getNonAckPercentage(): number {
    if (this.totalExecutions === 0) return 0;
    return (this.nonAckExecutions / this.totalExecutions) * 100;
  }

  initializeCharts(): void {
    const refs = [
      this.donutChartRef,
      this.histogramChartRef,
      this.barChartRef,
      this.statusChartRef,
      this.sideChartRef,
      this.tradersChartRef,
      this.regionChartRef,
      this.orderTypeChartRef,
      this.currencyChartRef,
      this.booksChartRef,
      this.hourlyChartRef
    ];
    
    if (refs.some(ref => !ref?.nativeElement)) {
      setTimeout(() => this.initializeCharts(), 200);
      return;
    }
    
    this.createDonutChart();
    this.createHistogramChart();
    this.createBarChart();
    this.createStatusChart();
    this.createSideChart();
    this.createTradersChart();
    this.createRegionChart();
    this.createOrderTypeChart();
    this.createCurrencyChart();
    this.createBooksChart();
    this.createHourlyChart();
  }

  createDonutChart(): void {
    if (!this.donutChartRef?.nativeElement) return;
    
    if (this.donutChart) {
      this.donutChart.destroy();
    }

    const instrumentCounts = new Map<string, number>();
    this.executions.forEach(exec => {
      const instrument = exec.instrument || 'UNKNOWN';
      instrumentCounts.set(instrument, (instrumentCounts.get(instrument) || 0) + 1);
    });

    const labels = Array.from(instrumentCounts.keys());
    const data = Array.from(instrumentCounts.values());
    
    // Use instrument-specific colors matching the filter colors
    const instrumentColors: { [key: string]: string } = {
      'STOCK': '#10b981',
      'FUTURE': '#6366f1',
      'OPTION': '#ec4899',
      'STRATEGY': '#14b8a6',
      'BOND': '#f97316',
      'FUND': '#a855f7'
    };
    
    const backgroundColor = labels.map(label => instrumentColors[label.toUpperCase()] || 'rgba(251, 139, 30, 0.6)');
    const borderColor = backgroundColor.map(() => 'transparent');

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: backgroundColor,
          borderColor: borderColor,
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        // @ts-ignore - cutout is valid for doughnut charts
        cutout: '65%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: '#ffffff',
              font: {
                family: 'Montserrat, sans-serif',
                size: 11
              },
              padding: 12,
              usePointStyle: true
            }
          },
          tooltip: {
            backgroundColor: '#0f0f0f',
            titleColor: '#ffffff',
            bodyColor: '#cccccc',
            borderColor: '#1a1a1a',
            borderWidth: 1,
            padding: 12,
            titleFont: {
              family: 'Montserrat, sans-serif'
            },
            bodyFont: {
              family: 'Montserrat, sans-serif'
            }
          }
        }
      }
    };

    this.donutChart = new Chart(this.donutChartRef.nativeElement, config);
  }

  createHistogramChart(): void {
    if (!this.histogramChartRef?.nativeElement) return;
    
    if (this.histogramChart) {
      this.histogramChart.destroy();
    }

    const micCounts = new Map<string, number>();
    this.executions.forEach(exec => {
      const mic = exec.mic || 'UNKNOWN';
      micCounts.set(mic, (micCounts.get(mic) || 0) + 1);
    });

    const sortedMics = Array.from(micCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const labels = sortedMics.map(([mic]) => mic);
    const data = sortedMics.map(([, count]) => count);
    const colors = this.generateColors(labels.length);

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Executions',
          data: data,
          backgroundColor: colors.background,
          borderColor: colors.border,
          borderWidth: 0,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#0f0f0f',
            titleColor: '#ffffff',
            bodyColor: '#cccccc',
            borderColor: '#1a1a1a',
            borderWidth: 1,
            padding: 12,
            titleFont: {
              family: 'Montserrat, sans-serif'
            },
            bodyFont: {
              family: 'Montserrat, sans-serif'
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              color: '#cccccc',
              font: {
                family: 'Montserrat, sans-serif',
                size: 11
              }
            },
            grid: {
              color: '#1a1a1a'
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: '#cccccc',
              font: {
                family: 'Montserrat, sans-serif',
                size: 11
              }
            },
            grid: {
              color: '#1a1a1a'
            }
          }
        }
      }
    };

    this.histogramChart = new Chart(this.histogramChartRef.nativeElement, config);
  }

  createBarChart(): void {
    if (!this.barChartRef?.nativeElement) return;
    
    if (this.barChart) {
      this.barChart.destroy();
    }

    const isinCounts = new Map<string, number>();
    this.executions.forEach(exec => {
      const isin = exec.isin || 'UNKNOWN';
      isinCounts.set(isin, (isinCounts.get(isin) || 0) + 1);
    });

    const sortedIsins = Array.from(isinCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);

    const labels = sortedIsins.map(([isin]) => isin);
    const data = sortedIsins.map(([, count]) => count);
    const colors = this.generateColors(labels.length);

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Executions',
          data: data,
          backgroundColor: colors.background,
          borderColor: colors.border,
          borderWidth: 0,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#0f0f0f',
            titleColor: '#ffffff',
            bodyColor: '#cccccc',
            borderColor: '#1a1a1a',
            borderWidth: 1,
            padding: 12,
            titleFont: {
              family: 'Montserrat, sans-serif'
            },
            bodyFont: {
              family: 'Montserrat, sans-serif'
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              color: '#cccccc',
              font: {
                family: 'Montserrat, sans-serif',
                size: 11
              }
            },
            grid: {
              color: '#1a1a1a'
            }
          },
          y: {
            ticks: {
              color: '#cccccc',
              font: {
                family: 'Montserrat, sans-serif',
                size: 10
              }
            },
            grid: {
              color: '#1a1a1a'
            }
          }
        }
      }
    };

    this.barChart = new Chart(this.barChartRef.nativeElement, config);
  }

  createStatusChart(): void {
    if (!this.statusChartRef?.nativeElement) return;
    
    if (this.statusChart) {
      this.statusChart.destroy();
    }

    const statusCounts = new Map<string, number>();
    this.executions.forEach(exec => {
      const status = exec.status || 'UNKNOWN';
      statusCounts.set(status, (statusCounts.get(status) || 0) + 1);
    });

    const labels = Array.from(statusCounts.keys());
    const data = Array.from(statusCounts.values());
    const colors = this.generateColors(labels.length);

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors.background,
          borderColor: colors.border,
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        // @ts-ignore - cutout is valid for doughnut charts
        cutout: '65%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: '#ffffff',
              font: {
                family: 'Montserrat, sans-serif',
                size: 10
              },
              padding: 10,
              usePointStyle: true
            }
          },
          tooltip: {
            backgroundColor: '#0f0f0f',
            titleColor: '#ffffff',
            bodyColor: '#cccccc',
            borderColor: '#1a1a1a',
            borderWidth: 1,
            padding: 12,
            titleFont: {
              family: 'Montserrat, sans-serif'
            },
            bodyFont: {
              family: 'Montserrat, sans-serif'
            }
          }
        }
      }
    };

    this.statusChart = new Chart(this.statusChartRef.nativeElement, config);
  }

  createSideChart(): void {
    if (!this.sideChartRef?.nativeElement) return;
    
    if (this.sideChart) {
      this.sideChart.destroy();
    }

    const sideCounts = new Map<string, number>();
    this.executions.forEach(exec => {
      const side = exec.side || 'UNKNOWN';
      sideCounts.set(side, (sideCounts.get(side) || 0) + 1);
    });

    const labels = Array.from(sideCounts.keys());
    const data = Array.from(sideCounts.values());
    const colors = this.generateColors(labels.length);

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Executions',
          data: data,
          backgroundColor: colors.background,
          borderColor: colors.border,
          borderWidth: 0,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#0f0f0f',
            titleColor: '#ffffff',
            bodyColor: '#cccccc',
            borderColor: '#1a1a1a',
            borderWidth: 1,
            padding: 12,
            titleFont: {
              family: 'Montserrat, sans-serif'
            },
            bodyFont: {
              family: 'Montserrat, sans-serif'
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              color: '#cccccc',
              font: {
                family: 'Montserrat, sans-serif',
                size: 10
              }
            },
            grid: {
              color: '#1a1a1a'
            }
          },
          y: {
            ticks: {
              color: '#cccccc',
              font: {
                family: 'Montserrat, sans-serif',
                size: 10
              }
            },
            grid: {
              color: '#1a1a1a'
            }
          }
        }
      }
    };

    this.sideChart = new Chart(this.sideChartRef.nativeElement, config);
  }

  createTradersChart(): void {
    if (!this.tradersChartRef?.nativeElement) return;
    
    if (this.tradersChart) {
      this.tradersChart.destroy();
    }

    const traderCounts = new Map<string, number>();
    this.executions.forEach(exec => {
      const trader = exec.trader || 'UNKNOWN';
      traderCounts.set(trader, (traderCounts.get(trader) || 0) + 1);
    });

    const sortedTraders = Array.from(traderCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const labels = sortedTraders.map(([trader]) => trader);
    const data = sortedTraders.map(([, count]) => count);
    const colors = this.generateColors(labels.length);

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Executions',
          data: data,
          backgroundColor: colors.background,
          borderColor: colors.border,
          borderWidth: 0,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#0f0f0f',
            titleColor: '#ffffff',
            bodyColor: '#cccccc',
            borderColor: '#1a1a1a',
            borderWidth: 1,
            padding: 12,
            titleFont: {
              family: 'Montserrat, sans-serif'
            },
            bodyFont: {
              family: 'Montserrat, sans-serif'
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              color: '#cccccc',
              font: {
                family: 'Montserrat, sans-serif',
                size: 10
              }
            },
            grid: {
              color: '#1a1a1a'
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: '#cccccc',
              font: {
                family: 'Montserrat, sans-serif',
                size: 9
              }
            },
            grid: {
              color: '#1a1a1a'
            }
          }
        }
      }
    };

    this.tradersChart = new Chart(this.tradersChartRef.nativeElement, config);
  }

  createRegionChart(): void {
    if (!this.regionChartRef?.nativeElement) return;
    
    if (this.regionChart) {
      this.regionChart.destroy();
    }

    const regionCounts = new Map<string, number>();
    this.executions.forEach(exec => {
      const region = exec.region || 'UNKNOWN';
      regionCounts.set(region, (regionCounts.get(region) || 0) + 1);
    });

    const labels = Array.from(regionCounts.keys());
    const data = Array.from(regionCounts.values());
    const colors = this.generateColors(labels.length);

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors.background,
          borderColor: colors.border,
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        // @ts-ignore - cutout is valid for doughnut charts
        cutout: '65%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: '#ffffff',
              font: {
                family: 'Montserrat, sans-serif',
                size: 10
              },
              padding: 10,
              usePointStyle: true
            }
          },
          tooltip: {
            backgroundColor: '#0f0f0f',
            titleColor: '#ffffff',
            bodyColor: '#cccccc',
            borderColor: '#1a1a1a',
            borderWidth: 1,
            padding: 12,
            titleFont: {
              family: 'Montserrat, sans-serif'
            },
            bodyFont: {
              family: 'Montserrat, sans-serif'
            }
          }
        }
      }
    };

    this.regionChart = new Chart(this.regionChartRef.nativeElement, config);
  }

  createOrderTypeChart(): void {
    if (!this.orderTypeChartRef?.nativeElement) return;
    
    if (this.orderTypeChart) {
      this.orderTypeChart.destroy();
    }

    const orderTypeCounts = new Map<string, number>();
    this.executions.forEach(exec => {
      const orderType = exec.orderType || 'UNKNOWN';
      orderTypeCounts.set(orderType, (orderTypeCounts.get(orderType) || 0) + 1);
    });

    const sortedOrderTypes = Array.from(orderTypeCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    const labels = sortedOrderTypes.map(([type]) => type);
    const data = sortedOrderTypes.map(([, count]) => count);
    const colors = this.generateColors(labels.length);

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Executions',
          data: data,
          backgroundColor: colors.background,
          borderColor: colors.border,
          borderWidth: 0,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#0f0f0f',
            titleColor: '#ffffff',
            bodyColor: '#cccccc',
            borderColor: '#1a1a1a',
            borderWidth: 1,
            padding: 12,
            titleFont: {
              family: 'Montserrat, sans-serif'
            },
            bodyFont: {
              family: 'Montserrat, sans-serif'
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              color: '#cccccc',
              font: {
                family: 'Montserrat, sans-serif',
                size: 10
              }
            },
            grid: {
              color: '#1a1a1a'
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: '#cccccc',
              font: {
                family: 'Montserrat, sans-serif',
                size: 10
              }
            },
            grid: {
              color: '#1a1a1a'
            }
          }
        }
      }
    };

    this.orderTypeChart = new Chart(this.orderTypeChartRef.nativeElement, config);
  }

  createCurrencyChart(): void {
    if (!this.currencyChartRef?.nativeElement) return;
    
    if (this.currencyChart) {
      this.currencyChart.destroy();
    }

    const currencyCounts = new Map<string, number>();
    this.executions.forEach(exec => {
      const currency = exec.currency || 'UNKNOWN';
      currencyCounts.set(currency, (currencyCounts.get(currency) || 0) + 1);
    });

    const sortedCurrencies = Array.from(currencyCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    const labels = sortedCurrencies.map(([currency]) => currency);
    const data = sortedCurrencies.map(([, count]) => count);
    const colors = this.generateColors(labels.length);

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Executions',
          data: data,
          backgroundColor: colors.background,
          borderColor: colors.border,
          borderWidth: 0,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#0f0f0f',
            titleColor: '#ffffff',
            bodyColor: '#cccccc',
            borderColor: '#1a1a1a',
            borderWidth: 1,
            padding: 12,
            titleFont: {
              family: 'Montserrat, sans-serif'
            },
            bodyFont: {
              family: 'Montserrat, sans-serif'
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              color: '#cccccc',
              font: {
                family: 'Montserrat, sans-serif',
                size: 10
              }
            },
            grid: {
              color: '#1a1a1a'
            }
          },
          y: {
            ticks: {
              color: '#cccccc',
              font: {
                family: 'Montserrat, sans-serif',
                size: 10
              }
            },
            grid: {
              color: '#1a1a1a'
            }
          }
        }
      }
    };

    this.currencyChart = new Chart(this.currencyChartRef.nativeElement, config);
  }

  createBooksChart(): void {
    if (!this.booksChartRef?.nativeElement) return;
    
    if (this.booksChart) {
      this.booksChart.destroy();
    }

    const bookCounts = new Map<string, number>();
    this.executions.forEach(exec => {
      const book = exec.book || 'UNKNOWN';
      bookCounts.set(book, (bookCounts.get(book) || 0) + 1);
    });

    const sortedBooks = Array.from(bookCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const labels = sortedBooks.map(([book]) => book);
    const data = sortedBooks.map(([, count]) => count);
    const colors = this.generateColors(labels.length);

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Executions',
          data: data,
          backgroundColor: colors.background,
          borderColor: colors.border,
          borderWidth: 0,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#0f0f0f',
            titleColor: '#ffffff',
            bodyColor: '#cccccc',
            borderColor: '#1a1a1a',
            borderWidth: 1,
            padding: 12,
            titleFont: {
              family: 'Montserrat, sans-serif'
            },
            bodyFont: {
              family: 'Montserrat, sans-serif'
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              color: '#cccccc',
              font: {
                family: 'Montserrat, sans-serif',
                size: 10
              }
            },
            grid: {
              color: '#1a1a1a'
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: '#cccccc',
              font: {
                family: 'Montserrat, sans-serif',
                size: 9
              }
            },
            grid: {
              color: '#1a1a1a'
            }
          }
        }
      }
    };

    this.booksChart = new Chart(this.booksChartRef.nativeElement, config);
  }

  createHourlyChart(): void {
    if (!this.hourlyChartRef?.nativeElement) return;
    
    if (this.hourlyChart) {
      this.hourlyChart.destroy();
    }

    // Group executions by hour (0-23)
    const hourlyCounts = new Map<number, number>();
    for (let i = 0; i < 24; i++) {
      hourlyCounts.set(i, 0);
    }

    this.executions.forEach(exec => {
      if (exec.executionTime) {
        const date = new Date(exec.executionTime);
        const hour = date.getHours();
        hourlyCounts.set(hour, (hourlyCounts.get(hour) || 0) + 1);
      }
    });

    // Create labels for all 24 hours
    const labels: string[] = [];
    const data: number[] = [];
    for (let i = 0; i < 24; i++) {
      labels.push(`${i.toString().padStart(2, '0')}:00`);
      data.push(hourlyCounts.get(i) || 0);
    }

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Executions',
          data: data,
          borderColor: 'rgba(251, 139, 30, 0.9)',
          backgroundColor: 'rgba(251, 139, 30, 0.1)',
          borderWidth: 1.5,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointBackgroundColor: 'rgba(251, 139, 30, 0.9)',
          pointBorderColor: '#0f0f0f',
          pointBorderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#0f0f0f',
            titleColor: '#ffffff',
            bodyColor: '#cccccc',
            borderColor: '#1a1a1a',
            borderWidth: 1,
            padding: 10,
            titleFont: {
              family: 'Montserrat, sans-serif',
              size: 11
            },
            bodyFont: {
              family: 'Montserrat, sans-serif',
              size: 10
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              color: '#cccccc',
              font: {
                family: 'Montserrat, sans-serif',
                size: 8
              },
              maxRotation: 45,
              minRotation: 45
            },
            grid: {
              color: '#1a1a1a',
              display: false
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: '#cccccc',
              font: {
                family: 'Montserrat, sans-serif',
                size: 8
              }
            },
            grid: {
              color: '#1a1a1a',
              display: false
            }
          }
        }
      }
    };

    this.hourlyChart = new Chart(this.hourlyChartRef.nativeElement, config);
  }

  generateColors(count: number): { background: string[], border: string[] } {
    // Orange shades only: #FB8B1E (251, 139, 30)
    const orangeShades = [
      'rgba(251, 139, 30, 0.9)',   // Full orange
      'rgba(251, 139, 30, 0.75)',  // Medium-high orange
      'rgba(251, 139, 30, 0.6)',   // Medium orange
      'rgba(251, 139, 30, 0.45)',  // Light orange
      'rgba(255, 165, 50, 0.8)',   // Lighter orange variant
      'rgba(255, 180, 70, 0.7)',   // Even lighter orange
      'rgba(255, 200, 90, 0.6)',   // Very light orange
      'rgba(251, 139, 30, 0.35)',  // Very light base orange
    ];

    // Use only orange shades, cycling through them
    const colors: string[] = [];
    for (let i = 0; i < count; i++) {
      colors.push(orangeShades[i % orangeShades.length]);
    }

    // Return transparent borders (no borders, only fill)
    const borders = colors.map(() => 'transparent');

    return { background: colors, border: borders };
  }
}
