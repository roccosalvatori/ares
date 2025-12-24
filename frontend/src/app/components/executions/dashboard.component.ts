import { Component, ViewEncapsulation, OnInit, OnDestroy, AfterViewInit, HostListener, ViewChild, ElementRef, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { ConfigService } from '../../services/config.service';
import { DatetimePickerComponent } from '../datetime-picker/datetime-picker.component';
import { LoaderComponent } from '../loader/loader.component';
import { ExecutionService, ExecutionData, TableColumn, AllFieldsConfig } from '../../services/execution.service';
import { MicCountryService } from '../../services/mic-country.service';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-executions',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FormsModule, DatetimePickerComponent, LoaderComponent],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('loaderFade', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.7)' }),
        animate('0.5s cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        style({ opacity: 1, transform: 'scale(1)' }),
        animate('0.5s cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 0, transform: 'scale(0.7)' }))
      ])
    ]),
    trigger('tagAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8) translateY(-8px)' }),
        animate('0.25s cubic-bezier(0.34, 1.56, 0.64, 1)', style({ opacity: 1, transform: 'scale(1) translateY(0)' }))
      ]),
      transition(':leave', [
        animate('0.2s cubic-bezier(0.4, 0, 1, 1)', style({ opacity: 0, transform: 'scale(0.8) translateY(-8px)' }))
      ])
    ]),
    trigger('panelAnimation', [
      transition(':enter', [
        style({ opacity: 0, height: 0, overflow: 'hidden' }),
        animate('0.3s cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, height: '*' }))
      ]),
      transition(':leave', [
        style({ overflow: 'hidden' }),
        animate('0.25s cubic-bezier(0.4, 0, 1, 1)', style({ opacity: 0, height: 0 }))
      ])
    ])
  ],
  template: `
    <app-navbar></app-navbar>
    <div class="dashboard-container">
      <div class="filters-section">
        <div class="filters-row">
          <div class="filter-group">
            <label class="filter-label">Region</label>
            <div class="toggle-switch-container">
              <div class="toggle-switch-track">
                <div class="toggle-slider" [style.transform]="getSliderTransform()"></div>
                <button 
                  *ngFor="let region of regions; let i = index" 
                  class="toggle-option"
                  [class.active]="selectedRegion === region"
                  (click)="selectRegion(region)">
                  {{ region }}
                </button>
              </div>
            </div>
          </div>
          <div class="filter-group">
            <label class="filter-label">FROM</label>
            <app-datetime-picker 
              [(value)]="fromDate" 
              [isOpen]="fromPickerOpen"
              (opened)="onFromPickerOpened()"
              (closed)="onFromPickerClosed()"
              placeholder="YYYY-MM-DD HH:MM:SS">
            </app-datetime-picker>
          </div>
          <div class="filter-group">
            <label class="filter-label">UNTIL</label>
            <app-datetime-picker 
              [(value)]="untilDate" 
              [isOpen]="untilPickerOpen"
              (opened)="onUntilPickerOpened()"
              (closed)="onUntilPickerClosed()"
              placeholder="YYYY-MM-DD HH:MM:SS">
            </app-datetime-picker>
          </div>
          <div class="filter-group">
            <label class="filter-label">MIC</label>
            <div class="dropdown-container">
              <input
                type="text"
                class="dropdown-input"
                [(ngModel)]="micSearchText"
                (input)="onMicInputChange()"
                (focus)="showMicDropdown = true"
                (blur)="onMicBlur()"
                placeholder="Search"
              />
              <div class="dropdown-list" *ngIf="showMicDropdown && filteredMicValues.length > 0">
                <div
                  *ngFor="let mic of filteredMicValues"
                  class="dropdown-item"
                  (mousedown)="selectMic(mic)"
                  [class.selected]="selectedMic === mic">
                  {{ mic }}
                </div>
              </div>
            </div>
          </div>
          <div class="filter-group">
            <label class="filter-label">ORDER ID</label>
            <input
              type="text"
              class="order-id-input"
              [(ngModel)]="orderId"
              placeholder="Enter Order ID"
            />
          </div>
          <div class="filter-group">
            <label class="filter-label">ISIN</label>
            <input
              type="text"
              class="isin-input"
              [(ngModel)]="isin"
              (input)="onIsinInput()"
              placeholder="Enter ISIN"
              maxlength="12"
            />
          </div>
          <div class="filter-group">
            <label class="filter-label">BLOOMBER LONG TICKER</label>
            <input
              type="text"
              class="bloomberg-ticker-input"
              [(ngModel)]="bloombergLongTicker"
              placeholder="Enter BBG Ticker"
            />
          </div>
          <div class="filter-group">
            <label class="filter-label">TRADER</label>
            <input
              type="text"
              class="trader-input"
              [(ngModel)]="trader"
              placeholder="Enter Trader"
            />
          </div>
          <div class="filter-group">
            <label class="filter-label">BOOK</label>
            <input
              type="text"
              class="book-input"
              [(ngModel)]="book"
              placeholder="Enter Book"
            />
          </div>
          <div class="filter-group">
            <label class="filter-label">STATUS</label>
            <div class="status-tags-container">
              <button
                *ngFor="let status of statusOptions"
                class="status-tag"
                [class.selected]="selectedStatuses.includes(status)"
                [class.ack]="status === 'ACK'"
                [class.ano]="status === 'ANO'"
                [class.timeout]="status === 'TIMEOUT'"
                [class.filtered]="status === 'FILTERED'"
                [class.pending]="status === 'PENDING'"
                [class.ignored]="status === 'IGNORED'"
                [class.error]="status === 'ERROR'"
                (click)="toggleStatus(status)">
                {{ status }}
              </button>
            </div>
          </div>
          <div class="filter-group">
            <label class="filter-label">INSTRUMENT</label>
            <div class="status-tags-container">
              <button
                *ngFor="let instrument of instrumentOptions"
                class="status-tag"
                [class.selected]="selectedInstruments.includes(instrument)"
                [class.stock]="instrument === 'STOCK'"
                [class.future]="instrument === 'FUTURE'"
                [class.option]="instrument === 'OPTION'"
                [class.strategy]="instrument === 'STRATEGY'"
                [class.bond]="instrument === 'BOND'"
                [class.fund]="instrument === 'FUND'"
                (click)="toggleInstrument(instrument)">
                {{ instrument }}
              </button>
            </div>
          </div>
        </div>
        <div class="search-button-container">
          <button class="search-btn" (click)="onSearch()">
            <span>SEARCH</span>
          </button>
          <button class="search-btn search-api-btn" (click)="onSearchRealApi()">
            <span>SEARCH API</span>
          </button>
        </div>
      </div>
      <div class="dashboard-message">
        <div *ngIf="isLoading" [@loaderFade] class="loader-wrapper">
          <app-loader></app-loader>
        </div>
        <div *ngIf="!isLoading && !hasSearched" class="logo-container-empty">
          <img src="assets/svgs/logos/ares-empty.svg" alt="ARES Logo" class="dashboard-logo">
        </div>
        <div *ngIf="!isLoading && hasSearched && executions.length > 0" class="executions-table-container">
          <!-- Column Manager with toggle -->
          <div class="column-manager">
            <button class="toggle-fields-btn" 
                    (click)="toggleFieldsPanel()"
                    [class.active]="showFieldsPanel"
                    [class.has-hidden]="hiddenFields.length > 0">
              <span class="btn-icon">{{ showFieldsPanel ? '−' : '+' }}</span>
              <span class="btn-text">{{ showFieldsPanel ? 'Hide' : 'Show' }} Fields</span>
              <span class="field-badge" *ngIf="hiddenFields.length > 0">{{ hiddenFields.length }}</span>
            </button>
            
            <div class="fields-panel" 
                 *ngIf="showFieldsPanel || isDraggingColumn"
                 [@panelAnimation]
                 (dragover)="onHiddenAreaDragOver($event)"
                 (dragleave)="onHiddenAreaDragLeave($event)"
                 (drop)="onDropToHidden($event)"
                 [class.drag-target]="isDraggingColumn && !isDraggingFromHidden"
                 [class.receiving]="isOverHiddenArea">
              <div class="panel-header">
                <span class="panel-title">Available Fields</span>
                <span class="panel-hint">Click to add • Drag to position</span>
              </div>
              <div class="hidden-fields-container">
                <div *ngFor="let field of hiddenFields; trackBy: trackByField"
                     class="field-tag"
                     [@tagAnimation]
                     [draggable]="true"
                     (click)="onTagClick(field)"
                     (dragstart)="onTagDragStart($event, field)"
                     (dragend)="onTagDragEnd($event)"
                     [class.dragging]="draggingField?.field === field.field">
                  <span class="tag-icon">+</span>
                  <span class="tag-text">{{ field.header }}</span>
                </div>
                <div *ngIf="hiddenFields.length === 0" class="drop-hint" [class.active]="isDraggingColumn && !isDraggingFromHidden">
                  <span *ngIf="!isDraggingColumn">All fields are displayed</span>
                  <span *ngIf="isDraggingColumn && !isDraggingFromHidden">Drop here to hide column</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Table with drop zones -->
          <div class="table-wrapper" #tableWrapper (scroll)="onScroll($event)">
          <table class="executions-table">
            <thead>
              <tr>
                <th *ngFor="let column of tableColumns; let i = index" 
                    [attr.data-col-index]="i"
                    [draggable]="true"
                    (dragstart)="onDragStart($event, i)"
                    (dragover)="onDragOver($event, i)"
                    (drop)="onDrop($event, i)"
                    (dragend)="onDragEnd($event)"
                    (dragleave)="onDragLeave()"
                    [class.dragging]="draggedColumnIndex === i"
                    [class.drag-over]="dragOverIndex === i && !isDraggingFromHidden"
                    [class.insert-left]="dragOverIndex === i && isDraggingFromHidden"
                    (mouseenter)="onHeaderHover(i)"
                    (mouseleave)="onHeaderLeave(i)"
                    [class.has-filter]="hasActiveFilter(i)">
                  <span class="header-content">{{ column.header }}</span>
                  <button class="filter-btn" 
                          *ngIf="hoveredHeaderIndex === i || activeFilterIndex === i"
                          (click)="toggleFilter($event, i)"
                          [class.active]="activeFilterIndex === i"
                          [class.has-filter]="hasActiveFilter(i)"
                          title="Filter column">
                    <span class="filter-icon">⚎</span>
                  </button>
                  <span class="drag-handle">⋮⋮</span>
                  
                  <!-- Filter Dropdown -->
                  <div class="filter-dropdown" 
                       *ngIf="activeFilterIndex === i"
                       [style.left.px]="getFilterDropdownLeft(i)"
                       [style.top.px]="getFilterDropdownTop(i)"
                       (click)="$event.stopPropagation()">
                    <div class="filter-header">
                      <span class="filter-title">Filter {{ column.header }}</span>
                      <button class="filter-close" (click)="closeFilter()">×</button>
                    </div>
                    <div class="filter-content">
                      <div class="filter-search">
                        <input type="text" 
                               class="filter-search-input"
                               [(ngModel)]="filterSearchText[i]"
                               (input)="onFilterSearchChange(i)"
                               placeholder="Search values..."
                               autofocus>
                      </div>
                      <div class="filter-values-list">
                        <div class="filter-select-all">
                          <label class="filter-checkbox-label">
                            <input type="checkbox" 
                                   [checked]="areAllValuesSelected(i)"
                                   (change)="toggleSelectAll(i, $event)"
                                   class="filter-checkbox">
                            <span>Select All ({{ getUniqueValues(i).length }})</span>
                          </label>
                        </div>
                        <div class="filter-values-scroll">
                          <label *ngFor="let value of getFilteredValues(i)" 
                                 class="filter-value-item"
                                 [class.selected]="isValueSelected(i, value)">
                            <input type="checkbox" 
                                   [checked]="isValueSelected(i, value)"
                                   (change)="toggleFilterValue(i, value, $event)"
                                   class="filter-checkbox">
                            <span class="filter-value-text">{{ formatFilterValue(value, column) }}</span>
                            <span class="filter-value-count">({{ getValueCount(i, value) }})</span>
                          </label>
                          <div *ngIf="getFilteredValues(i).length === 0" class="filter-no-results">
                            No values found
                          </div>
                        </div>
                      </div>
                      <div class="filter-footer">
                        <button class="filter-clear-btn" 
                                *ngIf="hasActiveFilter(i)"
                                (click)="clearFilter(i)">
                          Clear Filter
                        </button>
                        <div class="filter-count" *ngIf="filteredExecutions.length !== executions.length">
                          Showing {{ filteredExecutions.length }} of {{ executions.length }} rows
                        </div>
                      </div>
                    </div>
                  </div>
                </th>
                  <!-- Drop zone at the end for adding new columns -->
                  <th *ngIf="isDraggingFromHidden" 
                      class="drop-zone-end"
                      (dragover)="onEndZoneDragOver($event)"
                      (dragleave)="onEndZoneDragLeave($event)"
                      (drop)="onDropAtEnd($event)"
                      [class.active]="isOverEndZone">
                    <span class="drop-zone-icon">+</span>
                </th>
              </tr>
            </thead>
            <tbody>
                <!-- Spacer row for virtual scrolling -->
                <tr *ngIf="visibleStartIndex > 0" class="virtual-spacer" [style.height.px]="visibleStartIndex * rowHeight">
                  <td [attr.colspan]="tableColumns.length + (isDraggingFromHidden ? 1 : 0)"></td>
                </tr>
                <tr *ngFor="let execution of displayedExecutions; let i = index; trackBy: trackByExecutionId"
                    [attr.data-row]="visibleStartIndex + i">
                  <td *ngFor="let column of tableColumns; let colIndex = index"
                      [tabindex]="0"
                      [attr.data-row]="visibleStartIndex + i"
                      [attr.data-col]="colIndex"
                      [class.focused]="isFocused(visibleStartIndex + i, colIndex)"
                      [class.selected]="isSelected(visibleStartIndex + i, colIndex)"
                      [class.selection-top]="isSelectionTop(visibleStartIndex + i, colIndex)"
                      [class.selection-bottom]="isSelectionBottom(visibleStartIndex + i, colIndex)"
                      [class.selection-left]="isSelectionLeft(visibleStartIndex + i, colIndex)"
                      [class.selection-right]="isSelectionRight(visibleStartIndex + i, colIndex)"
                      (click)="onCellClick($event, visibleStartIndex + i, colIndex)"
                      (mousedown)="onCellMouseDown($event, visibleStartIndex + i, colIndex)"
                      (mouseenter)="onCellMouseEnter($event, visibleStartIndex + i, colIndex)"
                      (keydown)="onCellKeyDown($event, visibleStartIndex + i, colIndex)"
                      (focus)="onCellFocus($event, visibleStartIndex + i, colIndex)"
                      (blur)="onCellBlur($event)">
                  <span *ngIf="column.type === 'decimal'">{{ getFieldValue(execution, column.field) | number:'1.2-2' }}</span>
                  <span *ngIf="column.type === 'number'">{{ getFieldValue(execution, column.field) | number }}</span>
                  <span *ngIf="column.type === 'datetime'">{{ formatDateTime(getFieldValue(execution, column.field)) }}</span>
                    <span *ngIf="column.type === 'flag'">
                      <img *ngIf="getFlagPath(execution, column.field)" 
                           [src]="getFlagPath(execution, column.field)" 
                           [alt]="getCountryCode(execution, column.field) || 'Unknown'"
                           class="flag-icon"
                           (error)="onFlagError($event)" />
                    </span>
                  <span *ngIf="column.field === 'side'" class="side-tag" [class.buy]="getFieldValue(execution, column.field) === 'BUY'" [class.sell]="getFieldValue(execution, column.field) === 'SELL'">
                    {{ getFieldValue(execution, column.field) }}
                  </span>
                  <span *ngIf="column.field === 'instrument'" class="instrument-tag" 
                        [class.stock]="getFieldValue(execution, column.field) === 'STOCK'"
                        [class.future]="getFieldValue(execution, column.field) === 'FUTURE'"
                        [class.option]="getFieldValue(execution, column.field) === 'OPTION'"
                        [class.strategy]="getFieldValue(execution, column.field) === 'STRATEGY'"
                        [class.bond]="getFieldValue(execution, column.field) === 'BOND'"
                        [class.fund]="getFieldValue(execution, column.field) === 'FUND'">
                    {{ getFieldValue(execution, column.field) }}
                  </span>
                  <span *ngIf="column.field === 'instrumentType'" class="instrument-tag" 
                        [class.stock]="getFieldValue(execution, column.field) === 'stock' || getFieldValue(execution, column.field) === 'STOCK'"
                        [class.future]="getFieldValue(execution, column.field) === 'future' || getFieldValue(execution, column.field) === 'FUTURE'"
                        [class.option]="getFieldValue(execution, column.field) === 'option' || getFieldValue(execution, column.field) === 'OPTION'"
                        [class.strategy]="getFieldValue(execution, column.field) === 'strategy' || getFieldValue(execution, column.field) === 'STRATEGY'"
                        [class.bond]="getFieldValue(execution, column.field) === 'bond' || getFieldValue(execution, column.field) === 'BOND'"
                        [class.fund]="getFieldValue(execution, column.field) === 'fund' || getFieldValue(execution, column.field) === 'FUND'">
                    {{ getFieldValue(execution, column.field) }}
                  </span>
                  <span *ngIf="column.field === 'region'" class="region-tag">
                    {{ getFieldValue(execution, column.field) }}
                  </span>
                  <span *ngIf="!column.type && column.field !== 'side' && column.field !== 'instrument' && column.field !== 'instrumentType' && column.field !== 'region'">{{ getFieldValue(execution, column.field) }}</span>
                </td>
                  <td *ngIf="isDraggingFromHidden" class="placeholder-cell"></td>
              </tr>
                <!-- Bottom spacer for virtual scrolling -->
                <tr *ngIf="visibleEndIndex < filteredExecutions.length" class="virtual-spacer" [style.height.px]="(filteredExecutions.length - visibleEndIndex) * rowHeight">
                  <td [attr.colspan]="tableColumns.length + (isDraggingFromHidden ? 1 : 0)"></td>
                </tr>
            </tbody>
          </table>
          </div>
        </div>
        <div *ngIf="!isLoading && hasSearched && executions.length === 0" class="no-results">
          <p>No executions found</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    app-executions {
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
      min-height: 100vh;
      max-height: 100vh;
      background: var(--bg-primary);
      display: flex;
      flex-direction: column;
      padding-top: 70px;
      box-sizing: border-box;
      position: relative;
      margin: 0 !important;
      overflow: hidden;
    }
    
    .dashboard-container > .filters-section {
      flex-shrink: 0;
    }
    
    .dashboard-container > .dashboard-message {
      flex: 1;
      min-height: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .filters-section {
      width: 100%;
      padding: 30px 40px;
      box-sizing: border-box;
      border-bottom: 1px solid var(--border-color);
      flex-shrink: 0;
    }

    .filters-row {
      display: flex;
      flex-wrap: wrap;
      gap: 24px;
      align-items: flex-end;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
      align-items: flex-start;
      width: auto;
      max-width: none;
    }
    
    .filter-group:has(.status-tags-container) {
      display: inline-flex !important;
      width: fit-content !important;
      max-width: 400px !important;
    }

    .filter-label {
      color: var(--text-primary);
      font-size: 0.9rem;
      font-weight: 600;
      font-family: 'Montserrat', sans-serif;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .toggle-switch-container {
      width: 100%;
      min-width: 400px;
      max-width: 400px;
    }

    .toggle-switch-track {
      position: relative;
      display: flex;
      background: var(--bg-secondary);
      border: 2px solid var(--border-color);
      border-radius: 50px;
      padding: 2px;
      overflow: hidden;
      height: 32px;
      box-sizing: border-box;
    }

    .toggle-slider {
      position: absolute;
      top: 2px;
      left: 2px;
      height: calc(100% - 4px);
      width: calc(25% - 2px);
      background: var(--text-primary);
      border-radius: 50px;
      transition: transform 0.3s ease;
      z-index: 1;
    }

    .toggle-option {
      flex: 1;
      position: relative;
      z-index: 2;
      padding: 6px 8px;
      background: transparent;
      border: none;
      color: var(--text-secondary);
      font-size: 0.75rem;
      font-weight: 500;
      font-family: 'Montserrat', sans-serif;
      cursor: pointer;
      transition: color 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      line-height: 1;
    }

    .toggle-option:hover {
      color: var(--text-secondary);
    }

    .toggle-option.active {
      color: var(--bg-primary);
      font-weight: 600;
    }

    .dropdown-container {
      position: relative;
      width: 100%;
      max-width: 100px;
    }

    .dropdown-input {
      width: 100%;
      padding: 6px 8px;
      background: var(--bg-secondary);
      border: 2px solid var(--border-color);
      border-radius: 50px;
      color: var(--text-primary);
      font-size: 0.75rem;
      font-weight: 500;
      font-family: 'Montserrat', sans-serif;
      outline: none;
      transition: border-color 0.3s ease;
      box-sizing: border-box;
      height: 32px;
      line-height: 20px;
      text-align: center;
    }

    .dropdown-input:focus {
      border-color: var(--border-hover);
    }

    .dropdown-input::placeholder {
      color: var(--text-placeholder);
      opacity: 0.6;
    }

    .dropdown-list {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      margin-top: 4px;
      background: var(--bg-secondary);
      border: 2px solid var(--border-color);
      border-radius: 8px;
      max-height: 200px;
      overflow-y: auto;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    }

    .dropdown-item {
      padding: 8px 12px;
      color: var(--text-primary);
      font-size: 0.75rem;
      font-weight: 500;
      font-family: 'Montserrat', sans-serif;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .dropdown-item:hover {
      background: var(--bg-tertiary);
    }

    .dropdown-item.selected {
      background: var(--bg-tertiary);
      color: var(--text-primary);
    }

    .order-id-input {
      width: 100%;
      min-width: 150px;
      max-width: 200px;
      padding: 6px 12px;
      background: var(--bg-secondary);
      border: 2px solid var(--border-color);
      border-radius: 50px;
      color: var(--text-primary);
      font-size: 0.75rem;
      font-weight: 500;
      font-family: 'Montserrat', sans-serif;
      outline: none;
      transition: border-color 0.3s ease;
      box-sizing: border-box;
      height: 32px;
      line-height: 20px;
    }

    .order-id-input:focus {
      border-color: var(--border-hover);
    }

    .order-id-input::placeholder {
      color: var(--text-placeholder);
      opacity: 0.6;
    }

    .isin-input {
      width: 100%;
      min-width: 120px;
      max-width: 150px;
      padding: 6px 12px;
      background: var(--bg-secondary);
      border: 2px solid var(--border-color);
      border-radius: 50px;
      color: var(--text-primary);
      font-size: 0.75rem;
      font-weight: 500;
      font-family: 'Montserrat', sans-serif;
      outline: none;
      transition: border-color 0.3s ease;
      box-sizing: border-box;
      height: 32px;
      line-height: 20px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .isin-input:focus {
      border-color: var(--border-hover);
    }

    .isin-input::placeholder {
      color: var(--text-placeholder);
      opacity: 0.6;
      text-transform: none;
      letter-spacing: normal;
    }

    .bloomberg-ticker-input {
      width: 100%;
      min-width: 200px;
      max-width: 250px;
      padding: 6px 12px;
      background: var(--bg-secondary);
      border: 2px solid var(--border-color);
      border-radius: 50px;
      color: var(--text-primary);
      font-size: 0.75rem;
      font-weight: 500;
      font-family: 'Montserrat', sans-serif;
      outline: none;
      transition: border-color 0.3s ease;
      box-sizing: border-box;
      height: 32px;
      line-height: 20px;
    }

    .bloomberg-ticker-input:focus {
      border-color: var(--border-hover);
    }

    .bloomberg-ticker-input::placeholder {
      color: var(--text-placeholder);
      opacity: 0.6;
    }

    .trader-input {
      width: 100%;
      min-width: 100px;
      max-width: 150px;
      padding: 6px 12px;
      background: var(--bg-secondary);
      border: 2px solid var(--border-color);
      border-radius: 50px;
      color: var(--text-primary);
      font-size: 0.75rem;
      font-weight: 500;
      font-family: 'Montserrat', sans-serif;
      outline: none;
      transition: border-color 0.3s ease;
      box-sizing: border-box;
      height: 32px;
      line-height: 20px;
    }

    .trader-input:focus {
      border-color: var(--border-hover);
    }

    .trader-input::placeholder {
      color: var(--text-placeholder);
      opacity: 0.6;
    }

    .book-input {
      width: 100%;
      min-width: 100px;
      max-width: 100px;
      padding: 6px 12px;
      background: var(--bg-secondary);
      border: 2px solid var(--border-color);
      border-radius: 50px;
      color: var(--text-primary);
      font-size: 0.75rem;
      font-weight: 500;
      font-family: 'Montserrat', sans-serif;
      outline: none;
      transition: border-color 0.3s ease;
      box-sizing: border-box;
      height: 32px;
      line-height: 20px;
    }

    .book-input:focus {
      border-color: var(--border-hover);
    }

    .book-input::placeholder {
      color: var(--text-placeholder);
      opacity: 0.6;
    }

    .status-tags-container {
      display: inline-flex;
      flex-wrap: wrap;
      gap: 8px;
      width: 310px;
    }

    .status-tag {
      padding: 4px 12px;
      border: 2px solid var(--border-color);
      border-radius: 50px;
      background: transparent;
      color: var(--text-secondary);
      font-size: 0.7rem;
      font-weight: 500;
      font-family: 'Montserrat', sans-serif;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      white-space: nowrap;
    }

    .status-tag:hover {
      border-color: var(--border-hover);
      color: var(--text-secondary);
    }

    .status-tag.selected {
      border-color: transparent;
      color: var(--text-primary);
      font-weight: 600;
    }

    .status-tag.ack.selected {
      background: #22c55e;
    }

    .status-tag.ano.selected {
      background: #3b82f6;
    }

    .status-tag.timeout.selected {
      background: #f59e0b;
    }

    .status-tag.filtered.selected {
      background: #8b5cf6;
    }

    .status-tag.pending.selected {
      background: #06b6d4;
    }

    .status-tag.ignored.selected {
      background: #6b7280;
    }

    .status-tag.error.selected {
      background: #ef4444;
    }

    .status-tag.stock.selected {
      background: #10b981;
    }

    .status-tag.future.selected {
      background: #6366f1;
    }

    .status-tag.option.selected {
      background: #ec4899;
    }

    .status-tag.strategy.selected {
      background: #14b8a6;
    }

    .status-tag.bond.selected {
      background: #f97316;
    }

    .status-tag.fund.selected {
      background: #a855f7;
    }

    .search-button-container {
      display: flex;
      justify-content: flex-start;
      margin-left: 0;
      margin-top: 20px;
      align-items: flex-start;
    }

    .search-btn {
      padding: 12px 48px;
      background: var(--text-primary);
      color: var(--bg-primary);
      border: 2px solid var(--text-primary);
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      font-family: 'Montserrat', sans-serif;
      cursor: pointer;
      text-transform: uppercase;
      margin-right: 12px;
    }

    .search-api-btn {
      background: #dc2626;
      color: white;
      border: 2px solid #dc2626;
    }

    .search-api-btn:hover {
      background: #b91c1c;
      border-color: #b91c1c;
    }
      letter-spacing: 1px;
    }
    
    .dashboard-message {
      text-align: center;
      color: var(--text-primary);
      width: 100%;
      max-width: 100%;
      padding: 20px 0 0 0;
      box-sizing: border-box;
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: stretch;
      justify-content: flex-start;
      overflow: hidden;
      min-height: 0;
      position: relative;
    }

    .loader-wrapper {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .logo-container-empty {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
    }

    .dashboard-logo {
      max-width: 400px;
      max-height: 400px;
      width: auto;
      height: auto;
      opacity: 0.8;
    }
    
    .btn-logout {
      margin-top: 32px;
      padding: 12px 32px;
      background: var(--bg-primary);
      color: var(--text-primary);
      border: none;
      border-radius: 0;
      cursor: pointer;
      font-weight: 600;
      font-size: 1rem;
      transition: all 0.3s;
      font-family: 'Montserrat', sans-serif;
    }
    
    .btn-logout:hover {
      background: var(--bg-secondary);
    }

    .executions-table-container {
      width: 100%;
      overflow: hidden;
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      padding: 20px 40px 40px 40px;
      margin: 0;
      box-sizing: border-box;
    }

    .executions-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      font-family: 'Montserrat', sans-serif;
      font-size: 0.85rem;
      background: var(--bg-primary);
      color: var(--text-primary);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      overflow: visible;
      table-layout: auto;
      display: table;
    }

    .executions-table thead {
      position: sticky;
      top: 0;
      z-index: 100;
      background: var(--bg-secondary);
    }

    .executions-table th {
      padding: 12px 16px;
      text-align: center;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.5px;
      color: var(--text-primary);
      border-bottom: 2px solid var(--border-color);
      border-right: 1px solid var(--border-color);
      background: var(--bg-secondary);
      white-space: nowrap;
      cursor: move;
      user-select: none;
      transition: background-color 0.2s ease, opacity 0.2s ease, border-color 0.2s ease;
      position: sticky;
      top: 0;
      z-index: 101;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .executions-table th.has-filter {
      border-bottom-color: #f97316;
    }

    .executions-table th .header-content {
      display: inline-block;
    }

    .filter-btn {
      position: absolute;
      right: 28px;
      top: 50%;
      transform: translateY(-50%);
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;
      transition: all 0.2s ease;
      opacity: 0;
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 24px;
      height: 24px;
    }

    .executions-table th:hover .filter-btn,
    .executions-table th .filter-btn.active {
      opacity: 1;
    }

    .filter-btn:hover {
      background: var(--bg-primary);
      border-color: var(--text-primary);
    }

    .filter-btn.has-filter {
      background: rgba(249, 115, 22, 0.2);
      border-color: #f97316;
    }

    .filter-btn.has-filter .filter-icon {
      color: #f97316;
    }

    .filter-icon {
      font-size: 0.75rem;
      color: var(--text-secondary);
      display: block;
      line-height: 1;
      font-weight: 600;
    }

    .filter-dropdown {
      position: fixed;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      z-index: 10000;
      min-width: 250px;
      max-width: 350px;
      max-height: 500px;
    }

    .filter-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 12px;
      border-bottom: 1px solid var(--border-color);
    }

    .filter-title {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-primary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-family: 'Montserrat', sans-serif;
    }

    .filter-close {
      background: transparent;
      border: none;
      color: var(--text-secondary);
      font-size: 1.2rem;
      cursor: pointer;
      padding: 0;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: all 0.2s ease;
    }

    .filter-close:hover {
      background: var(--bg-tertiary);
      color: var(--text-primary);
    }

    .filter-content {
      padding: 0;
      max-height: 400px;
      display: flex;
      flex-direction: column;
    }

    .filter-search {
      padding: 10px 12px;
      border-bottom: 1px solid var(--border-color);
    }

    .filter-search-input {
      width: 100%;
      padding: 6px 10px;
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: 4px;
      color: var(--text-primary);
      font-size: 0.8rem;
      font-family: 'Montserrat', sans-serif;
      outline: none;
      transition: border-color 0.2s ease;
      box-sizing: border-box;
    }

    .filter-search-input:focus {
      border-color: var(--text-primary);
    }

    .filter-values-list {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .filter-select-all {
      padding: 8px 12px;
      border-bottom: 1px solid var(--border-color);
      background: var(--bg-tertiary);
    }

    .filter-checkbox-label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-primary);
      font-family: 'Montserrat', sans-serif;
    }

    .filter-values-scroll {
      overflow-y: auto;
      max-height: 300px;
      padding: 4px 0;
    }

    .filter-value-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      cursor: pointer;
      transition: background-color 0.15s ease;
      font-size: 0.75rem;
      font-family: 'Montserrat', sans-serif;
    }

    .filter-value-item:hover {
      background: var(--bg-tertiary);
    }

    .filter-value-item.selected {
      background: rgba(34, 197, 94, 0.1);
    }

    .filter-checkbox {
      cursor: pointer;
      margin: 0;
    }

    .filter-value-text {
      flex: 1;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .filter-value-count {
      color: var(--text-secondary);
      font-size: 0.7rem;
      opacity: 0.7;
    }

    .filter-no-results {
      padding: 12px;
      text-align: center;
      color: var(--text-secondary);
      font-size: 0.75rem;
      font-family: 'Montserrat', sans-serif;
    }

    .filter-footer {
      padding: 10px 12px;
      border-top: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .filter-clear-btn {
      padding: 6px 12px;
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      border-radius: 4px;
      color: var(--text-secondary);
      font-size: 0.75rem;
      font-family: 'Montserrat', sans-serif;
      cursor: pointer;
      transition: all 0.2s ease;
      width: 100%;
    }

    .filter-clear-btn:hover {
      background: var(--bg-primary);
      color: var(--text-primary);
      border-color: var(--text-primary);
    }

    .filter-count {
      font-size: 0.7rem;
      color: var(--text-secondary);
      font-family: 'Montserrat', sans-serif;
      text-align: center;
    }

    .executions-table th .drag-handle {
      display: inline-block;
      font-size: 0.5rem;
      color: var(--text-secondary);
      opacity: 0.5;
      letter-spacing: -1px;
      line-height: 1;
      transition: opacity 0.2s ease, color 0.2s ease;
      vertical-align: middle;
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      z-index: 1;
    }

    .executions-table th:hover .drag-handle {
      opacity: 0.8;
      color: var(--text-primary);
    }

    .executions-table th:last-child {
      border-right: none;
    }

    .executions-table th.dragging {
      opacity: 0.5;
      background: var(--bg-tertiary);
    }

    .executions-table th.drag-over {
      background: var(--bg-tertiary);
      border-left: 2px solid var(--text-primary);
    }

    .executions-table th:hover {
      background: var(--bg-tertiary);
    }

    .executions-table td {
      padding: 10px 16px;
      border-bottom: 1px solid var(--border-color);
      border-right: 1px solid var(--border-color);
      color: var(--text-primary);
      white-space: nowrap;
      position: relative;
      outline: none;
      cursor: cell;
      transition: background-color 0.15s ease, border-color 0.15s ease;
      user-select: none;
    }

    .executions-table td:last-child {
      border-right: none;
    }

    .executions-table tbody tr {
      transition: background-color 0.2s ease;
    }

    .executions-table tbody tr:hover td:not(.selected):not(.focused) {
      background: var(--bg-secondary);
    }

    .executions-table tbody tr:last-child td {
      border-bottom: none;
    }

    /* Excel-like cell focus and selection */
    .executions-table td.focused:not(.selected) {
      border: 2px solid white;
      z-index: 1;
      box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.5);
    }

    /* Focused cell within selection should only show selection borders */
    .executions-table td.selected.focused {
      border: none;
      box-shadow: none;
    }

    /* Selection range - only external borders */
    .executions-table td.selected {
      border-top: none;
      border-bottom: none;
      border-left: none;
      border-right: none;
    }

    /* Top border for selection range */
    .executions-table td.selected.selection-top {
      border-top: 2px solid white;
    }

    /* Bottom border for selection range */
    .executions-table td.selected.selection-bottom {
      border-bottom: 2px solid white;
    }

    /* Left border for selection range */
    .executions-table td.selected.selection-left {
      border-left: 2px solid white;
    }

    /* Right border for selection range */
    .executions-table td.selected.selection-right {
      border-right: 2px solid white;
    }

    /* Prevent text selection during cell selection */
    .executions-table tbody {
      user-select: none;
      display: table-row-group;
    }

    .executions-table td:focus {
      outline: none;
    }

    .no-results {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: var(--text-secondary);
      font-size: 1rem;
      font-family: 'Montserrat', sans-serif;
    }

    .flag-icon {
      width: 24px;
      height: 18px;
      object-fit: cover;
      border-radius: 2px;
      display: inline-block;
      vertical-align: middle;
      border: 1px solid var(--border-color);
    }

    .side-tag {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      font-family: 'Montserrat', sans-serif;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #ffffff;
    }

    .side-tag.buy {
      background-color: #0068ff;
    }

    .side-tag.sell {
      background-color: #ef4444;
    }

    .instrument-tag {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      font-family: 'Montserrat', sans-serif;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #ffffff;
    }

    .instrument-tag.stock {
      background-color: #10b981;
    }

    .instrument-tag.future {
      background-color: #6366f1;
    }

    .instrument-tag.option {
      background-color: #ec4899;
    }

    .instrument-tag.strategy {
      background-color: #14b8a6;
    }

    .instrument-tag.bond {
      background-color: #f97316;
    }

    .instrument-tag.fund {
      background-color: #a855f7;
    }

    .region-tag {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      font-family: 'Montserrat', sans-serif;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #ffffff;
      background-color: #ffffff;
      color: #1f2937;
      border: 1px solid #e5e7eb;
    }

    /* Column Manager Styles */
    .column-manager {
      margin-bottom: 16px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .toggle-fields-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      color: var(--text-secondary);
      font-size: 0.8rem;
      font-weight: 500;
      font-family: 'Montserrat', sans-serif;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-bottom: 12px;
      width: 200px;
      justify-content: flex-start;
      position: relative;
    }

    .toggle-fields-btn:hover {
      background: var(--bg-tertiary);
      border-color: var(--border-hover);
      color: var(--text-primary);
    }

    .toggle-fields-btn.active {
      background: var(--bg-tertiary);
      border-color: var(--text-primary);
      color: var(--text-primary);
    }

    .toggle-fields-btn.has-hidden:not(.active) {
      border-color: #22c55e;
    }

    .btn-icon {
      font-size: 1rem;
      font-weight: 700;
      line-height: 1;
      width: 16px;
      text-align: center;
    }

    .btn-text {
      text-transform: uppercase;
      letter-spacing: 0.5px;
      min-width: 85px;
      text-align: left;
    }

    .field-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 20px;
      height: 20px;
      padding: 0 6px;
      background: #22c55e;
      color: white;
      font-size: 0.7rem;
      font-weight: 600;
      border-radius: 10px;
      margin-left: auto;
    }

    .fields-panel {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      overflow: hidden;
      transition: border-color 0.3s ease, box-shadow 0.3s ease;
      width: 100%;
      align-self: stretch;
    }

    .fields-panel.drag-target {
      border-color: var(--text-secondary);
    }

    .fields-panel.receiving {
      border-color: #ef4444;
      box-shadow: inset 0 0 20px rgba(239, 68, 68, 0.1);
    }

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      background: var(--bg-tertiary);
      border-bottom: 1px solid var(--border-color);
    }

    .panel-title {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-primary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-family: 'Montserrat', sans-serif;
    }

    .panel-hint {
      font-size: 0.7rem;
      color: var(--text-secondary);
      font-family: 'Montserrat', sans-serif;
      opacity: 0.7;
    }

    .hidden-fields-container {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 12px;
      min-height: 44px;
      align-items: center;
    }

    .field-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: 20px;
      color: var(--text-primary);
      font-size: 0.75rem;
      font-weight: 500;
      font-family: 'Montserrat', sans-serif;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      user-select: none;
    }

    .field-tag:hover {
      background: #22c55e;
      border-color: #22c55e;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
    }

    .field-tag:hover .tag-icon {
      color: white;
    }

    .field-tag:active {
      transform: translateY(0);
      box-shadow: 0 2px 4px rgba(34, 197, 94, 0.2);
    }

    .field-tag.dragging {
      opacity: 0.4;
      transform: scale(0.95);
    }

    .tag-icon {
      font-size: 0.8rem;
      font-weight: 700;
      color: #22c55e;
      line-height: 1;
      transition: color 0.2s ease;
    }

    .tag-text {
      white-space: nowrap;
    }

    .drop-hint {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px 16px;
      color: var(--text-secondary);
      font-size: 0.75rem;
      font-family: 'Montserrat', sans-serif;
      font-style: italic;
      opacity: 0.5;
      width: 100%;
      transition: all 0.2s ease;
    }

    .drop-hint.active {
      opacity: 1;
      color: #ef4444;
      font-weight: 500;
      font-style: normal;
    }

    .table-wrapper {
      flex: 1;
      overflow-y: auto;
      overflow-x: auto;
      min-height: 0;
      position: relative;
      -webkit-overflow-scrolling: touch;
    }
    
    .virtual-spacer {
      padding: 0 !important;
      border: none !important;
      display: table-row;
    }
    
    .virtual-spacer td {
      padding: 0 !important;
      border: none !important;
      height: inherit;
    }

    /* Enhanced table header for drag-drop */
    .executions-table th.insert-left {
      position: relative;
    }

    .executions-table th.insert-left::before {
      content: '';
      position: absolute;
      left: -2px;
      top: 0;
      bottom: 0;
      width: 4px;
      background: #22c55e;
      border-radius: 2px;
      animation: pulse-insert 1s ease-in-out infinite;
    }

    @keyframes pulse-insert {
      0%, 100% { opacity: 1; transform: scaleY(1); }
      50% { opacity: 0.7; transform: scaleY(0.95); }
    }

    /* Drop zone at end of table */
    .drop-zone-end {
      min-width: 60px;
      background: var(--bg-tertiary) !important;
      border: 2px dashed var(--border-color) !important;
      border-left: none !important;
      transition: all 0.2s ease;
      text-align: center;
    }

    .drop-zone-end.active {
      background: rgba(34, 197, 94, 0.15) !important;
      border-color: #22c55e !important;
    }

    .drop-zone-icon {
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--text-secondary);
      opacity: 0.5;
    }

    .drop-zone-end.active .drop-zone-icon {
      color: #22c55e;
      opacity: 1;
    }

    .placeholder-cell {
      min-width: 60px;
      background: var(--bg-tertiary);
      border: 2px dashed var(--border-color) !important;
      border-left: none !important;
    }

    /* Smooth animations for column changes */
    .executions-table th,
    .executions-table td {
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
  `]
})
export class ExecutionsComponent implements OnInit, OnDestroy, AfterViewInit {
  isLoading: boolean = false;
  hasSearched: boolean = false;
  executions: ExecutionData[] = [];
  tableColumns: TableColumn[] = [];
  allFields: TableColumn[] = [];
  hiddenFields: TableColumn[] = [];
  draggedColumnIndex: number | null = null;
  dragOverIndex: number | null = null;
  
  // New drag-drop state
  draggingField: TableColumn | null = null;
  isDraggingColumn: boolean = false;
  isDraggingFromHidden: boolean = false;
  isOverHiddenArea: boolean = false;
  isOverEndZone: boolean = false;
  showFieldsPanel: boolean = false;

  // Excel-like cell selection state
  focusedCell: { row: number; col: number } | null = null;
  selectionStart: { row: number; col: number } | null = null;
  selectionEnd: { row: number; col: number } | null = null;
  isSelecting: boolean = false;

  // Filter state
  hoveredHeaderIndex: number | null = null;
  activeFilterIndex: number | null = null;
  columnFilters: { selectedValues: Set<string> }[] = [];
  filterSearchText: string[] = [];
  filteredExecutions: ExecutionData[] = [];
  
  regions: string[] = ['ALL', 'PARIS', 'AMERICAS', 'ASIA'];
  selectedRegion: string = 'ALL';
  
  micValues: string[] = [];
  filteredMicValues: string[] = [];
  selectedMic: string = '';
  micSearchText: string = '';
  showMicDropdown: boolean = false;
  orderId: string = '';
  isin: string = '';
  bloombergLongTicker: string = '';
  trader: string = '';
  book: string = '';
  fromDate: string = '';
  untilDate: string = '';
  fromPickerOpen: boolean = false;
  untilPickerOpen: boolean = false;
  statusOptions: string[] = ['ACK', 'ANO', 'TIMEOUT', 'FILTERED', 'PENDING', 'IGNORED', 'ERROR'];
  selectedStatuses: string[] = [];
  instrumentOptions: string[] = ['STOCK', 'FUTURE', 'OPTION', 'STRATEGY', 'BOND', 'FUND'];
  selectedInstruments: string[] = [];


  executionCountryCodes: Map<number | string, string> = new Map();

  // Virtual scrolling state
  @ViewChild('tableWrapper', { static: false }) tableWrapperRef!: ElementRef<HTMLElement>;
  rowHeight: number = 42; // Approximate height of a table row in pixels
  headerHeight: number = 50; // Approximate height of table header
  visibleStartIndex: number = 0;
  visibleEndIndex: number = 50; // Initial visible rows
  bufferSize: number = 10; // Extra rows to render above/below viewport
  displayedExecutions: ExecutionData[] = [];
  private tableWrapperElement: HTMLElement | null = null;
  private scrollListenerAdded: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private configService: ConfigService,
    private executionService: ExecutionService,
    private micCountryService: MicCountryService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    // Initialize fromDate with current date at midnight
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    this.fromDate = this.formatDateTimeForPicker(now);
    
    this.loadMicValues();
    this.loadAllFields();
  }

  ngOnDestroy(): void {
    // Cleanup scroll listener
    if (this.tableWrapperElement) {
      this.tableWrapperElement.removeEventListener('scroll', this.onScroll.bind(this));
    }
  }
  
  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.updateVisibleRows();
  }
  
  ngAfterViewInit(): void {
    // Get table wrapper element after view init
    setTimeout(() => {
      const element = this.tableWrapperRef?.nativeElement || 
                     document.querySelector('.table-wrapper') as HTMLElement;
      
      if (element) {
        this.tableWrapperElement = element;
        // Add programmatic listener as backup to template handler
        if (!this.scrollListenerAdded) {
          element.addEventListener('scroll', (e) => this.onScroll(e), { passive: true });
          this.scrollListenerAdded = true;
        }
        // Initial update
        this.updateVisibleRows();
      }
    }, 100);
  }
  
  onScroll(event?: Event): void {
    // Get the scrollable element
    let element: HTMLElement | null = null;
    
    if (event?.target) {
      element = event.target as HTMLElement;
    } else if (this.tableWrapperRef?.nativeElement) {
      element = this.tableWrapperRef.nativeElement;
    } else if (this.tableWrapperElement) {
      element = this.tableWrapperElement;
    } else {
      element = document.querySelector('.table-wrapper') as HTMLElement;
    }
    
    if (!element) {
      return;
    }
    
    // Store reference
    this.tableWrapperElement = element;
    
    // Run in Angular zone to ensure change detection
    this.ngZone.run(() => {
      if (this.filteredExecutions.length === 0) {
        this.displayedExecutions = [];
        return;
      }
      
      const scrollTop = element!.scrollTop;
      const containerHeight = element!.clientHeight;
      
      // Calculate visible range
      const startIndex = Math.max(0, Math.floor(scrollTop / this.rowHeight) - this.bufferSize);
      const endIndex = Math.min(
        this.filteredExecutions.length,
        Math.ceil((scrollTop + containerHeight) / this.rowHeight) + this.bufferSize
      );
      
      // Update displayed rows
      this.visibleStartIndex = startIndex;
      this.visibleEndIndex = endIndex;
      this.displayedExecutions = [...this.filteredExecutions.slice(startIndex, endIndex)];
      
      // Force change detection
      this.cdr.detectChanges();
    });
  }
  
  updateVisibleRows(): void {
    if (this.filteredExecutions.length === 0) {
      this.displayedExecutions = [];
      this.cdr.markForCheck();
      return;
    }
    
    // Get element reference if not set
    if (!this.tableWrapperElement) {
      if (this.tableWrapperRef?.nativeElement) {
        this.tableWrapperElement = this.tableWrapperRef.nativeElement;
      } else {
        this.tableWrapperElement = document.querySelector('.table-wrapper') as HTMLElement;
      }
    }
    
    // If wrapper element not found yet, show initial rows (fallback)
    if (!this.tableWrapperElement) {
      const initialEndIndex = Math.min(this.filteredExecutions.length, this.visibleEndIndex);
      this.visibleStartIndex = 0;
      this.visibleEndIndex = initialEndIndex;
      this.displayedExecutions = [...this.filteredExecutions.slice(0, initialEndIndex)];
      this.cdr.markForCheck();
      return;
    }
    
    const scrollTop = this.tableWrapperElement.scrollTop || 0;
    const containerHeight = this.tableWrapperElement.clientHeight || 500;
    
    // Calculate visible range
    const startIndex = Math.max(0, Math.floor(scrollTop / this.rowHeight) - this.bufferSize);
    const endIndex = Math.min(
      this.filteredExecutions.length,
      Math.ceil((scrollTop + containerHeight) / this.rowHeight) + this.bufferSize
    );
    
    // Always update to ensure changes are reflected
    this.visibleStartIndex = startIndex;
    this.visibleEndIndex = endIndex;
    this.displayedExecutions = [...this.filteredExecutions.slice(startIndex, endIndex)];
    
    // Trigger change detection
    this.cdr.markForCheck();
  }
  
  trackByExecutionId(index: number, execution: ExecutionData): number {
    return execution.executionId ?? index;
  }
  

  @HostListener('document:mouseup', ['$event'])
  onDocumentMouseUp(event: MouseEvent): void {
    if (this.isSelecting) {
      this.isSelecting = false;
    }
  }

  @HostListener('document:keydown', ['$event'])
  onDocumentKeyDown(event: KeyboardEvent): void {
    // Copy functionality (Ctrl+C or Cmd+C)
    if ((event.ctrlKey || event.metaKey) && event.key === 'c' && this.selectionStart && this.selectionEnd) {
      this.copySelection();
      event.preventDefault();
      return;
    }
    
    // Paste functionality (Ctrl+V or Cmd+V)
    if ((event.ctrlKey || event.metaKey) && event.key === 'v' && this.focusedCell) {
      this.pasteSelection();
      event.preventDefault();
      return;
    }

    // Close filter on Escape
    if (event.key === 'Escape' && this.activeFilterIndex !== null) {
      this.closeFilter();
      return;
    }

    // Handle arrow keys when a cell is focused
    if (this.focusedCell && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      const target = event.target as HTMLElement;
      // Only handle if we're in a table cell or no input is focused
      if (target.tagName === 'TD' || (!target.matches('input, textarea, select'))) {
        const row = this.focusedCell.row;
        const col = this.focusedCell.col;
        this.onCellKeyDown(event, row, col);
      }
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Close filter when clicking outside
    if (this.activeFilterIndex !== null) {
      const target = event.target as HTMLElement;
      if (!target.closest('.filter-dropdown') && !target.closest('.filter-btn')) {
        this.closeFilter();
      }
    }
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(): void {
    // Update filter position on scroll
    if (this.activeFilterIndex !== null) {
      // Trigger change detection to update position
      setTimeout(() => {
        this.updateFilterPosition(this.activeFilterIndex!);
      }, 0);
    }
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(): void {
    // Update filter position on resize
    if (this.activeFilterIndex !== null) {
      setTimeout(() => {
        this.updateFilterPosition(this.activeFilterIndex!);
      }, 0);
    }
  }

  loadAllFields(): void {
    // Load all available fields first
    this.executionService.getAllFields().subscribe({
      next: (config) => {
        this.allFields = config.fields;
    this.loadTableColumns();
      },
      error: (error) => {
        console.error('Error loading all fields:', error);
      }
    });
  }

  loadTableColumns(): void {
    this.executionService.getTableColumns().subscribe({
      next: (config) => {
        this.tableColumns = config.columns;
        this.updateHiddenFields();
      },
      error: (error) => {
        console.error('Error loading table columns:', error);
      }
    });
  }

  updateHiddenFields(): void {
    const displayedFieldNames = new Set(this.tableColumns.map(col => col.field));
    this.hiddenFields = this.allFields.filter(field => !displayedFieldNames.has(field.field));
  }

  trackByField(index: number, field: TableColumn): string {
    return field.field;
  }

  toggleFieldsPanel(): void {
    this.showFieldsPanel = !this.showFieldsPanel;
  }

  onTagClick(field: TableColumn): void {
    // Add field to the end of the table
    this.tableColumns = [...this.tableColumns, field];
    this.updateHiddenFields();
    
    // Auto-hide panel if all fields are now displayed
    if (this.hiddenFields.length === 0) {
      this.showFieldsPanel = false;
    }
  }

  loadMicValues(): void {
    this.configService.getMicValues().subscribe(values => {
      this.micValues = values;
      this.filteredMicValues = values;
    });
  }

  filterMicValues(): void {
    if (!this.micSearchText || this.micSearchText.trim() === '') {
      this.filteredMicValues = this.micValues;
    } else {
      const searchLower = this.micSearchText.toLowerCase();
      this.filteredMicValues = this.micValues.filter(mic =>
        mic.toLowerCase().includes(searchLower)
      );
    }
    this.showMicDropdown = true;
  }

  selectMic(mic: string): void {
    this.selectedMic = mic;
    this.micSearchText = mic;
    this.showMicDropdown = false;
  }

  onMicBlur(): void {
    // Delay hiding dropdown to allow click events to fire
    setTimeout(() => {
      this.showMicDropdown = false;
      // Validate that the current input is a valid MIC value
      this.validateMicInput();
    }, 200);
  }

  validateMicInput(): void {
    // If the input doesn't match any valid MIC value, clear it
    if (this.micSearchText && !this.micValues.includes(this.micSearchText)) {
      this.micSearchText = '';
      this.selectedMic = '';
    } else if (this.micSearchText && this.micValues.includes(this.micSearchText)) {
      // Ensure selectedMic is set if it's a valid value
      this.selectedMic = this.micSearchText;
    }
  }

  onMicInputChange(): void {
    this.filterMicValues();
    // If user types something that matches exactly, select it
    if (this.micSearchText && this.micValues.includes(this.micSearchText)) {
      this.selectedMic = this.micSearchText;
    } else if (this.micSearchText && !this.micValues.includes(this.micSearchText)) {
      // Clear selection if input doesn't match
      this.selectedMic = '';
    }
  }

  selectRegion(region: string): void {
    this.selectedRegion = region;
  }

  getSliderTransform(): string {
    const index = this.regions.indexOf(this.selectedRegion);
    const percentage = index * 100;
    return `translateX(${percentage}%)`;
  }

  onIsinInput(): void {
    // Convert to uppercase and limit to 12 characters
    this.isin = this.isin.toUpperCase().slice(0, 12);
  }

  toggleStatus(status: string): void {
    const index = this.selectedStatuses.indexOf(status);
    if (index > -1) {
      this.selectedStatuses.splice(index, 1);
    } else {
      this.selectedStatuses.push(status);
    }
  }

  toggleInstrument(instrument: string): void {
    const index = this.selectedInstruments.indexOf(instrument);
    if (index > -1) {
      this.selectedInstruments.splice(index, 1);
    } else {
      this.selectedInstruments.push(instrument);
    }
  }

  onFromPickerOpened(): void {
    this.fromPickerOpen = true;
    this.untilPickerOpen = false; // Close the other picker
  }

  onFromPickerClosed(): void {
    this.fromPickerOpen = false;
  }

  onUntilPickerOpened(): void {
    this.untilPickerOpen = true;
    this.fromPickerOpen = false; // Close the other picker
  }

  onUntilPickerClosed(): void {
    this.untilPickerOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onSearch(): void {
    this.isLoading = true;
    this.hasSearched = false;
    console.log('Search clicked - fetching from API endpoint');
    
    // Fetch execution data from API endpoint with fromDate parameter
    this.executionService.fetchApiExecutions(this.fromDate).subscribe({
      next: (data) => {
        this.executions = data;
        this.filteredExecutions = data;
        this.loadCountryCodes(data);
        this.initializeFilters();
        this.hasSearched = true;
        this.isLoading = false;
        // Initialize displayed executions immediately - show first batch
        this.visibleStartIndex = 0;
        this.visibleEndIndex = Math.min(this.filteredExecutions.length, 50);
        this.displayedExecutions = [...this.filteredExecutions.slice(0, this.visibleEndIndex)];
        
        // Set up element reference and ensure scroll handler works
        setTimeout(() => {
          if (this.tableWrapperRef?.nativeElement) {
            this.tableWrapperElement = this.tableWrapperRef.nativeElement;
          } else {
            const wrapper = document.querySelector('.table-wrapper') as HTMLElement;
            if (wrapper) {
              this.tableWrapperElement = wrapper;
            }
          }
          // Force change detection after setup
          this.cdr.detectChanges();
        }, 0);
      },
      error: (error) => {
        console.error('Error fetching executions:', error);
        this.executions = [];
        this.filteredExecutions = [];
        this.displayedExecutions = [];
        this.hasSearched = true;
        this.isLoading = false;
      }
    });
  }

  onSearchRealApi(): void {
    this.isLoading = true;
    this.hasSearched = false;
    console.log('Search API clicked - fetching from real API endpoint');
    
    // Fetch execution data from real API endpoint with fromDate parameter
    this.executionService.fetchRealApiExecutions(this.fromDate).subscribe({
      next: (data) => {
        this.executions = data;
        this.filteredExecutions = data;
        this.loadCountryCodes(data);
        this.initializeFilters();
        this.hasSearched = true;
        this.isLoading = false;
        // Initialize displayed executions immediately - show first batch
        this.visibleStartIndex = 0;
        this.visibleEndIndex = Math.min(this.filteredExecutions.length, 50);
        this.displayedExecutions = [...this.filteredExecutions.slice(0, this.visibleEndIndex)];
        
        // Set up element reference and ensure scroll handler works
        setTimeout(() => {
          if (this.tableWrapperRef?.nativeElement) {
            this.tableWrapperElement = this.tableWrapperRef.nativeElement;
          } else {
            const wrapper = document.querySelector('.table-wrapper') as HTMLElement;
            if (wrapper) {
              this.tableWrapperElement = wrapper;
            }
          }
          // Force change detection after setup
          this.cdr.detectChanges();
        }, 0);
      },
      error: (error) => {
        console.error('Error fetching real API executions:', error);
        this.executions = [];
        this.filteredExecutions = [];
        this.displayedExecutions = [];
        this.hasSearched = true;
        this.isLoading = false;
      }
    });
  }

  initializeFilters(): void {
    this.columnFilters = [];
    this.filterSearchText = [];
    this.tableColumns.forEach(() => {
      this.columnFilters.push({ selectedValues: new Set<string>() });
      this.filterSearchText.push('');
    });
  }

  loadCountryCodes(executions: ExecutionData[]): void {
    this.executionCountryCodes.clear();
    if (!executions || executions.length === 0) {
      return;
    }
    
    const countryCodeRequests = executions
      .filter(execution => execution && execution.mic) // Filter out null/undefined executions and mic
      .map((execution, index) => {
        // Use orderId as key (always set), fallback to index if orderId is somehow missing
        const key = execution.orderId || `exec_${index}`;
        return this.micCountryService.getCountryCode(execution.mic).pipe(
          map(countryCode => ({ 
            key: key,
            countryCode 
          }))
        );
      });

    if (countryCodeRequests.length === 0) {
      return;
    }

    forkJoin(countryCodeRequests).subscribe({
      next: (results) => {
        results.forEach(({ key, countryCode }) => {
          if (countryCode && key != null) {
            this.executionCountryCodes.set(key, countryCode);
          }
        });
      },
      error: (error) => {
        console.error('Error loading country codes:', error);
      }
    });
  }

  getCountryCode(execution: ExecutionData, field: string): string | null {
    if (field === 'country') {
      if (!execution || !execution.orderId) {
        return null;
      }
      // Use orderId as key (same as in loadCountryCodes)
      return this.executionCountryCodes.get(execution.orderId) || null;
    }
    return null;
  }

  getFlagPath(execution: ExecutionData, field: string): string | null {
    if (field === 'country') {
      const countryCode = this.getCountryCode(execution, field);
      return this.micCountryService.getFlagPath(countryCode);
    }
    return null;
  }

  onFlagError(event: Event): void {
    // Hide broken flag images
    const img = event.target as HTMLImageElement;
    if (img) {
      img.style.display = 'none';
    }
  }

  // Excel-like cell selection methods
  onCellClick(event: MouseEvent, row: number, col: number): void {
    if (event.shiftKey && this.focusedCell) {
      // Extend selection
      this.selectionStart = this.focusedCell;
      this.selectionEnd = { row, col };
    } else {
      // Single cell selection
      this.focusedCell = { row, col };
      this.selectionStart = { row, col };
      this.selectionEnd = { row, col };
    }
    this.isSelecting = false;
    event.preventDefault();
  }

  onCellMouseDown(event: MouseEvent, row: number, col: number): void {
    if (event.button === 0) { // Left mouse button
      this.isSelecting = true;
      this.focusedCell = { row, col };
      this.selectionStart = { row, col };
      this.selectionEnd = { row, col };
      event.preventDefault();
    }
  }

  onCellMouseEnter(event: MouseEvent, row: number, col: number): void {
    if (this.isSelecting && this.selectionStart) {
      this.selectionEnd = { row, col };
      this.focusedCell = { row, col };
      // Scroll into view if needed
      const cell = event.target as HTMLElement;
      if (cell) {
        cell.focus();
      }
    }
  }

  onCellKeyDown(event: KeyboardEvent, row: number, col: number): void {
    if (!this.focusedCell) {
      this.focusedCell = { row, col };
      return;
    }

    let newRow = this.focusedCell.row;
    let newCol = this.focusedCell.col;
    let shouldMove = false;

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        event.stopPropagation();
        if (newRow > 0) {
          newRow--;
          shouldMove = true;
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        event.stopPropagation();
        if (newRow < this.filteredExecutions.length - 1) {
          newRow++;
          shouldMove = true;
          // Ensure the new row is visible in virtual scroll
          if (newRow >= this.visibleEndIndex) {
            this.scrollToRow(newRow);
          }
        }
        break;
      case 'ArrowLeft':
        event.preventDefault();
        event.stopPropagation();
        if (newCol > 0) {
          newCol--;
          shouldMove = true;
        }
        break;
      case 'ArrowRight':
        event.preventDefault();
        event.stopPropagation();
        if (newCol < this.tableColumns.length - 1) {
          newCol++;
          shouldMove = true;
        }
        break;
      case 'Tab':
        if (event.shiftKey) {
          if (newCol > 0) {
            newCol--;
          } else if (newRow > 0) {
            newRow--;
            newCol = this.tableColumns.length - 1;
          }
        } else {
          if (newCol < this.tableColumns.length - 1) {
            newCol++;
          } else if (newRow < this.filteredExecutions.length - 1) {
            newRow++;
            newCol = 0;
          }
        }
        shouldMove = true;
        event.preventDefault();
        break;
      case 'Enter':
        if (newRow < this.filteredExecutions.length - 1) {
          newRow++;
          shouldMove = true;
        }
        event.preventDefault();
        break;
      case 'Home':
        newCol = 0;
        shouldMove = true;
        event.preventDefault();
        break;
      case 'End':
        newCol = this.tableColumns.length - 1;
        shouldMove = true;
        event.preventDefault();
        break;
    }

    if (shouldMove) {
      if (event.shiftKey && this.selectionStart) {
        // Extend selection
        this.selectionEnd = { row: newRow, col: newCol };
      } else {
        // Move focus
        this.focusedCell = { row: newRow, col: newCol };
        this.selectionStart = { row: newRow, col: newCol };
        this.selectionEnd = { row: newRow, col: newCol };
      }

      // Focus the new cell
      setTimeout(() => {
        const cell = document.querySelector(`td[data-row="${newRow}"][data-col="${newCol}"]`) as HTMLElement;
        if (cell) {
          cell.focus();
          cell.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
        }
      }, 0);
    }
  }

  onCellFocus(event: FocusEvent, row: number, col: number): void {
    if (!this.focusedCell || (this.focusedCell.row !== row || this.focusedCell.col !== col)) {
      this.focusedCell = { row, col };
      if (!this.selectionStart) {
        this.selectionStart = { row, col };
        this.selectionEnd = { row, col };
      }
    }
  }

  onCellBlur(event: FocusEvent): void {
    // Keep selection visible even when cell loses focus
  }

  isFocused(row: number, col: number): boolean {
    return this.focusedCell?.row === row && this.focusedCell?.col === col;
  }

  isSelected(row: number, col: number): boolean {
    if (!this.selectionStart || !this.selectionEnd) return false;
    
    const minRow = Math.min(this.selectionStart.row, this.selectionEnd.row);
    const maxRow = Math.max(this.selectionStart.row, this.selectionEnd.row);
    const minCol = Math.min(this.selectionStart.col, this.selectionEnd.col);
    const maxCol = Math.max(this.selectionStart.col, this.selectionEnd.col);
    
    return row >= minRow && row <= maxRow && col >= minCol && col <= maxCol;
  }

  isSelectionStart(row: number, col: number): boolean {
    return this.selectionStart?.row === row && this.selectionStart?.col === col;
  }

  isSelectionEnd(row: number, col: number): boolean {
    return this.selectionEnd?.row === row && this.selectionEnd?.col === col;
  }

  isSelectionTop(row: number, col: number): boolean {
    if (!this.isSelected(row, col)) return false;
    if (!this.selectionStart || !this.selectionEnd) return false;
    const minRow = Math.min(this.selectionStart.row, this.selectionEnd.row);
    return row === minRow;
  }

  isSelectionBottom(row: number, col: number): boolean {
    if (!this.isSelected(row, col)) return false;
    if (!this.selectionStart || !this.selectionEnd) return false;
    const maxRow = Math.max(this.selectionStart.row, this.selectionEnd.row);
    return row === maxRow;
  }

  isSelectionLeft(row: number, col: number): boolean {
    if (!this.isSelected(row, col)) return false;
    if (!this.selectionStart || !this.selectionEnd) return false;
    const minCol = Math.min(this.selectionStart.col, this.selectionEnd.col);
    return col === minCol;
  }

  isSelectionRight(row: number, col: number): boolean {
    if (!this.isSelected(row, col)) return false;
    if (!this.selectionStart || !this.selectionEnd) return false;
    const maxCol = Math.max(this.selectionStart.col, this.selectionEnd.col);
    return col === maxCol;
  }

  // Copy selection to clipboard
  copySelection(): void {
    if (!this.selectionStart || !this.selectionEnd) return;

    const minRow = Math.min(this.selectionStart.row, this.selectionEnd.row);
    const maxRow = Math.max(this.selectionStart.row, this.selectionEnd.row);
    const minCol = Math.min(this.selectionStart.col, this.selectionEnd.col);
    const maxCol = Math.max(this.selectionStart.col, this.selectionEnd.col);

    const rows: string[] = [];
    for (let row = minRow; row <= maxRow; row++) {
      const cells: string[] = [];
      for (let col = minCol; col <= maxCol; col++) {
        const execution = this.filteredExecutions[row];
        const column = this.tableColumns[col];
        if (execution && column) {
          let value = this.getCellValue(execution, column);
          // Escape tabs and newlines for TSV format
          value = value.replace(/\t/g, ' ').replace(/\n/g, ' ').replace(/\r/g, '');
          cells.push(value);
        } else {
          cells.push('');
        }
      }
      rows.push(cells.join('\t'));
    }

    const text = rows.join('\n');
    
    // Copy to clipboard
    navigator.clipboard.writeText(text).then(() => {
      console.log('Copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      this.fallbackCopyToClipboard(text);
    });
  }

  // Fallback copy method
  private fallbackCopyToClipboard(text: string): void {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
    } catch (err) {
      console.error('Fallback copy failed:', err);
    }
    document.body.removeChild(textArea);
  }

  // Paste from clipboard
  pasteSelection(): void {
    if (!this.focusedCell) return;

    navigator.clipboard.readText().then(text => {
      this.pasteData(text, this.focusedCell!.row, this.focusedCell!.col);
    }).catch(err => {
      console.error('Failed to read clipboard:', err);
    });
  }

  // Paste data starting at the focused cell
  private pasteData(text: string, startRow: number, startCol: number): void {
    const lines = text.split(/\r?\n/).filter(line => line.trim());
    if (lines.length === 0) return;

    lines.forEach((line, rowOffset) => {
      const row = startRow + rowOffset;
      if (row >= this.filteredExecutions.length) return;

      const cells = line.split('\t');
      cells.forEach((cellValue, colOffset) => {
        const col = startCol + colOffset;
        if (col >= this.tableColumns.length) return;

        const execution = this.filteredExecutions[row];
        const column = this.tableColumns[col];
        if (execution && column && column.field !== 'country') {
          // Only paste to editable fields (not computed fields like country)
          this.setCellValue(execution, column, cellValue.trim());
        }
      });
    });
  }

  // Get cell value as string
  private getCellValue(execution: ExecutionData, column: TableColumn): string {
    if (column.type === 'flag') {
      const countryCode = this.getCountryCode(execution, column.field);
      return countryCode || '';
    }
    
    const value = this.getFieldValue(execution, column.field);
    
    if (value === null || value === undefined) {
      return '';
    }
    
    if (column.type === 'decimal') {
      return Number(value).toFixed(2);
    }
    
    if (column.type === 'datetime') {
      return this.formatDateTime(value);
    }
    
    return String(value);
  }

  // Filter functionality
  onHeaderHover(index: number): void {
    this.hoveredHeaderIndex = index;
  }

  onHeaderLeave(index: number): void {
    if (this.activeFilterIndex !== index) {
      this.hoveredHeaderIndex = null;
    }
  }

  toggleFilter(event: Event, index: number): void {
    event.stopPropagation();
    if (this.activeFilterIndex === index) {
      this.closeFilter();
    } else {
      this.activeFilterIndex = index;
      this.hoveredHeaderIndex = index;
      // Calculate position after view update
      setTimeout(() => {
        this.updateFilterPosition(index);
      }, 0);
    }
  }

  updateFilterPosition(columnIndex: number): void {
    // Position is calculated dynamically in getFilterDropdownLeft/Top
  }

  getFilterDropdownLeft(columnIndex: number): number {
    if (this.activeFilterIndex !== columnIndex) return 0;
    
    const headerElement = document.querySelector(`th[data-col-index="${columnIndex}"]`) as HTMLElement;
    if (headerElement) {
      const rect = headerElement.getBoundingClientRect();
      return rect.left;
    }
    return 0;
  }

  getFilterDropdownTop(columnIndex: number): number {
    if (this.activeFilterIndex !== columnIndex) return 0;
    
    const headerElement = document.querySelector(`th[data-col-index="${columnIndex}"]`) as HTMLElement;
    if (headerElement) {
      const rect = headerElement.getBoundingClientRect();
      return rect.bottom + 4;
    }
    return 0;
  }

  closeFilter(): void {
    this.activeFilterIndex = null;
    if (this.hoveredHeaderIndex !== null) {
      // Keep hover state if mouse is still over header
      setTimeout(() => {
        if (this.activeFilterIndex === null) {
          this.hoveredHeaderIndex = null;
        }
      }, 100);
    }
  }

  hasActiveFilter(index: number): boolean {
    const filter = this.columnFilters[index];
    return filter ? filter.selectedValues.size > 0 : false;
  }

  getUniqueValues(columnIndex: number): string[] {
    const column = this.tableColumns[columnIndex];
    if (!column) return [];

    const values = new Set<string>();
    this.executions.forEach(execution => {
      const value = this.getCellValue(execution, column);
      if (value !== null && value !== undefined && value !== '') {
        values.add(String(value));
      }
    });

    return Array.from(values).sort();
  }

  getFilteredValues(columnIndex: number): string[] {
    const allValues = this.getUniqueValues(columnIndex);
    const searchText = (this.filterSearchText[columnIndex] || '').toLowerCase().trim();
    
    if (!searchText) {
      return allValues;
    }

    return allValues.filter(value => 
      String(value).toLowerCase().includes(searchText)
    );
  }

  isValueSelected(columnIndex: number, value: string): boolean {
    const filter = this.columnFilters[columnIndex];
    return filter ? filter.selectedValues.has(value) : false;
  }

  toggleFilterValue(columnIndex: number, value: string, event: Event): void {
    const filter = this.columnFilters[columnIndex];
    if (!filter) return;

    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      filter.selectedValues.add(value);
    } else {
      filter.selectedValues.delete(value);
    }
    this.applyFilters();
  }

  areAllValuesSelected(columnIndex: number): boolean {
    const filteredValues = this.getFilteredValues(columnIndex);
    if (filteredValues.length === 0) return false;

    const filter = this.columnFilters[columnIndex];
    if (!filter) return false;

    return filteredValues.every(value => filter.selectedValues.has(value));
  }

  toggleSelectAll(columnIndex: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const filteredValues = this.getFilteredValues(columnIndex);
    const filter = this.columnFilters[columnIndex];
    
    if (!filter) return;

    if (checked) {
      filteredValues.forEach(value => filter.selectedValues.add(value));
    } else {
      filteredValues.forEach(value => filter.selectedValues.delete(value));
    }
    this.applyFilters();
  }

  getValueCount(columnIndex: number, value: string): number {
    const column = this.tableColumns[columnIndex];
    if (!column) return 0;

    return this.executions.filter(execution => {
      const cellValue = this.getCellValue(execution, column);
      return String(cellValue) === String(value);
    }).length;
  }

  getFilterCount(columnIndex: number): number {
    const filter = this.columnFilters[columnIndex];
    return filter ? filter.selectedValues.size : 0;
  }

  formatFilterValue(value: string, column: TableColumn): string {
    if (column.type === 'decimal') {
      const num = parseFloat(value);
      return isNaN(num) ? value : num.toFixed(2);
    }
    if (column.type === 'number') {
      const num = parseFloat(value);
      return isNaN(num) ? value : num.toString();
    }
    return value;
  }

  onFilterSearchChange(columnIndex: number): void {
    // Just triggers change detection, filtering happens in getFilteredValues
  }

  clearFilter(index: number): void {
    const filter = this.columnFilters[index];
    if (filter) {
      filter.selectedValues.clear();
      this.filterSearchText[index] = '';
      this.applyFilters();
    }
  }

  applyFilters(): void {
    let filtered = [...this.executions];

    this.columnFilters.forEach((filter, colIndex) => {
      if (!filter || filter.selectedValues.size === 0) {
        return;
      }

      const column = this.tableColumns[colIndex];
      if (!column) return;

      filtered = filtered.filter(execution => {
        const cellValue = String(this.getCellValue(execution, column));
        return filter.selectedValues.has(cellValue);
      });
    });

    this.filteredExecutions = filtered;
    // Reset scroll position and update virtual scrolling after filtering
    this.visibleStartIndex = 0;
    if (this.tableWrapperElement) {
      this.tableWrapperElement.scrollTop = 0;
    }
    this.updateVisibleRows();
  }

  // Set cell value (for paste functionality)
  private setCellValue(execution: ExecutionData, column: TableColumn, value: string): void {
    // Note: This is a frontend-only change. In a real app, you'd want to send this to the backend
    const field = column.field as keyof ExecutionData;
    
    if (column.type === 'number' || column.type === 'decimal') {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        (execution as any)[field] = numValue;
      }
    } else if (column.type === 'datetime') {
      // Try to parse date
      const dateValue = new Date(value);
      if (!isNaN(dateValue.getTime())) {
        (execution as any)[field] = dateValue.toISOString();
      }
    } else {
      (execution as any)[field] = value;
    }
  }

  getFieldValue(execution: ExecutionData, field: string): any {
    return (execution as any)[field];
  }

  formatDateTime(dateTime: string): string {
    if (!dateTime) return '';
    try {
      const date = new Date(dateTime);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    } catch {
      return dateTime;
    }
  }

  formatDateTimeForPicker(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  }

  // Table column drag handlers
  onDragStart(event: DragEvent, index: number): void {
    this.draggedColumnIndex = index;
    this.isDraggingColumn = true;
    this.isDraggingFromHidden = false;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', `column:${index}`);
    }
  }

  onDragOver(event: DragEvent, index: number): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    this.dragOverIndex = index;
  }

  onDrop(event: DragEvent, dropIndex: number): void {
    event.preventDefault();
    
    // Handle dropping a hidden field tag onto a column
    if (this.isDraggingFromHidden && this.draggingField) {
      const columns = [...this.tableColumns];
      columns.splice(dropIndex, 0, this.draggingField);
      this.tableColumns = columns;
      this.updateHiddenFields();
      this.resetDragState();
      return;
    }
    
    // Handle reordering existing columns
    if (this.draggedColumnIndex === null || this.draggedColumnIndex === dropIndex) {
      this.resetDragState();
      return;
    }

    const columns = [...this.tableColumns];
    const draggedColumn = columns[this.draggedColumnIndex];
    columns.splice(this.draggedColumnIndex, 1);
    columns.splice(dropIndex, 0, draggedColumn);
    this.tableColumns = columns;

    this.resetDragState();
  }

  onDragEnd(event: DragEvent): void {
    this.resetDragState();
  }

  onDragLeave(): void {
    this.dragOverIndex = null;
  }

  // Hidden field tag drag handlers
  onTagDragStart(event: DragEvent, field: TableColumn): void {
    this.draggingField = field;
    this.isDraggingColumn = true;
    this.isDraggingFromHidden = true;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', `field:${field.field}`);
    }
  }

  onTagDragEnd(event: DragEvent): void {
    this.resetDragState();
  }

  // Hidden area drop handlers (for removing columns)
  onHiddenAreaDragOver(event: DragEvent): void {
    event.preventDefault();
    if (this.isDraggingColumn && !this.isDraggingFromHidden) {
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'move';
      }
      this.isOverHiddenArea = true;
    }
  }

  onHiddenAreaDragLeave(event: DragEvent): void {
    this.isOverHiddenArea = false;
  }

  onDropToHidden(event: DragEvent): void {
    event.preventDefault();
    
    // Only handle dropping table columns to remove them
    if (this.draggedColumnIndex !== null && !this.isDraggingFromHidden) {
      const columns = [...this.tableColumns];
      columns.splice(this.draggedColumnIndex, 1);
      this.tableColumns = columns;
      this.updateHiddenFields();
    }
    
    this.resetDragState();
  }

  // End zone handlers (for adding columns at the end)
  onEndZoneDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    this.isOverEndZone = true;
  }

  onEndZoneDragLeave(event: DragEvent): void {
    this.isOverEndZone = false;
  }

  onDropAtEnd(event: DragEvent): void {
    event.preventDefault();
    
    if (this.isDraggingFromHidden && this.draggingField) {
      const columns = [...this.tableColumns];
      columns.push(this.draggingField);
      this.tableColumns = columns;
      this.updateHiddenFields();
    }
    
    this.resetDragState();
  }

  // Helper to reset all drag state
  private resetDragState(): void {
    this.draggedColumnIndex = null;
    this.dragOverIndex = null;
    this.draggingField = null;
    this.isDraggingColumn = false;
    this.isDraggingFromHidden = false;
    this.isOverHiddenArea = false;
    this.isOverEndZone = false;
  }
  
  // Scroll to a specific row in virtual scroll
  scrollToRow(rowIndex: number): void {
    if (this.tableWrapperElement) {
      const scrollTop = rowIndex * this.rowHeight;
      this.tableWrapperElement.scrollTop = scrollTop;
      this.updateVisibleRows();
    }
  }
}

