import { Component, ViewEncapsulation, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-datetime-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="datetime-picker-wrapper">
      <input
        type="text"
        class="datetime-input"
        [value]="value"
        (focus)="openPicker()"
        (blur)="onBlur()"
        [placeholder]="placeholder"
        readonly
        (mousedown)="$event.preventDefault(); openPicker()"
      />
      <div class="datetime-picker" *ngIf="showPicker" (click)="$event.stopPropagation()">
        <div class="calendar-header">
          <button type="button" class="nav-btn" (click)="previousMonth(); $event.stopPropagation()">‹</button>
          <span class="month-year">{{ getMonthYear() }}</span>
          <button type="button" class="nav-btn" (click)="nextMonth(); $event.stopPropagation()">›</button>
        </div>
        <div class="calendar-weekdays">
          <div class="weekday" *ngFor="let day of weekDays">{{ day }}</div>
        </div>
        <div class="calendar-days">
          <div
            *ngFor="let day of getCalendarDays(); let i = index"
            class="calendar-day"
            [class.other-month]="day.otherMonth"
            [class.selected]="isDateSelected(day.date)"
            [class.today]="isToday(day.date)"
            (mousedown)="selectDate(day.date); $event.stopPropagation(); $event.preventDefault()"
            (click)="$event.stopPropagation()">
            {{ day.day }}
          </div>
        </div>
        <div class="time-picker">
          <div class="time-input-group">
            <label>Hour</label>
            <div class="time-input-wrapper">
              <input type="number" class="time-input" [(ngModel)]="hour" min="0" max="23" (input)="updateDateTime()" (click)="$event.stopPropagation()" (focus)="$event.stopPropagation()" />
              <div class="time-spinner">
                <button type="button" class="spinner-btn up" (click)="incrementHour(); $event.stopPropagation()">▲</button>
                <button type="button" class="spinner-btn down" (click)="decrementHour(); $event.stopPropagation()">▼</button>
              </div>
            </div>
          </div>
          <span class="time-separator">:</span>
          <div class="time-input-group">
            <label>Minute</label>
            <div class="time-input-wrapper">
              <input type="number" class="time-input" [(ngModel)]="minute" min="0" max="59" (input)="updateDateTime()" (click)="$event.stopPropagation()" (focus)="$event.stopPropagation()" />
              <div class="time-spinner">
                <button type="button" class="spinner-btn up" (click)="incrementMinute(); $event.stopPropagation()">▲</button>
                <button type="button" class="spinner-btn down" (click)="decrementMinute(); $event.stopPropagation()">▼</button>
              </div>
            </div>
          </div>
          <span class="time-separator">:</span>
          <div class="time-input-group">
            <label>Second</label>
            <div class="time-input-wrapper">
              <input type="number" class="time-input" [(ngModel)]="second" min="0" max="59" (input)="updateDateTime()" (click)="$event.stopPropagation()" (focus)="$event.stopPropagation()" />
              <div class="time-spinner">
                <button type="button" class="spinner-btn up" (click)="incrementSecond(); $event.stopPropagation()">▲</button>
                <button type="button" class="spinner-btn down" (click)="decrementSecond(); $event.stopPropagation()">▼</button>
              </div>
            </div>
          </div>
        </div>
        <div class="picker-actions">
          <button type="button" class="picker-btn" (click)="clearDate(); $event.stopPropagation()">Clear</button>
          <button type="button" class="picker-btn primary" (click)="applyDate(); $event.stopPropagation()">Apply</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .datetime-picker-wrapper {
      position: relative;
      width: 100%;
      min-width: 200px;
      max-width: 250px;
    }

    .datetime-input {
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
      cursor: pointer;
    }

    .datetime-input:focus {
      border-color: var(--border-hover);
    }

    .datetime-input::placeholder {
      color: var(--text-placeholder);
      opacity: 0.6;
    }

    .datetime-picker {
      position: absolute;
      top: calc(100% + 8px);
      left: 0;
      z-index: 1000;
      background: var(--bg-secondary);
      border: 2px solid var(--border-color);
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
      padding: 16px;
      min-width: 280px;
      font-family: 'Montserrat', sans-serif;
    }

    .calendar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 10px;
      border-bottom: 1px solid #333;
    }

    .nav-btn {
      background: transparent;
      border: 1px solid var(--border-color);
      color: #ffffff;
      width: 32px;
      height: 32px;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: 600;
      transition: all 0.2s ease;
    }

    .nav-btn:hover {
      background: var(--bg-tertiary);
      border-color: var(--border-hover);
    }

    .month-year {
      color: #ffffff;
      font-size: 0.9rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .calendar-weekdays {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 3px;
      margin-bottom: 10px;
    }

    .weekday {
      color: var(--text-secondary);
      font-size: 0.7rem;
      font-weight: 600;
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 8px 0;
    }

    .calendar-days {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 3px;
      margin-bottom: 16px;
    }

    .calendar-day {
      aspect-ratio: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-size: 0.8rem;
      font-weight: 500;
      cursor: pointer;
      border-radius: 6px;
      transition: all 0.2s ease;
      border: 1px solid transparent;
    }

    .calendar-day:hover {
      background: var(--bg-tertiary);
      border-color: var(--border-hover);
    }

    .calendar-day.other-month {
      color: var(--text-secondary);
    }

    .calendar-day.today {
      border-color: var(--border-hover);
      font-weight: 600;
    }

    .calendar-day.selected {
      background: var(--bg-tertiary);
      border-color: var(--border-hover);
      color: var(--text-primary);
      font-weight: 600;
    }

    .time-picker {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 12px 0;
      border-top: 1px solid #333;
      border-bottom: 1px solid #333;
      margin-bottom: 12px;
    }

    .time-input-group {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }

    .time-input-group label {
      color: var(--text-secondary);
      font-size: 0.65rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .time-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .time-input {
      width: 60px;
      padding: 8px 24px 8px 8px;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      color: var(--text-primary);
      font-size: 0.85rem;
      font-weight: 500;
      text-align: center;
      font-family: 'Montserrat', sans-serif;
      outline: none;
      transition: all 0.2s ease;
      -moz-appearance: textfield;
    }

    .time-input::-webkit-outer-spin-button,
    .time-input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    .time-input[type=number] {
      -moz-appearance: textfield;
    }

    .time-input:focus {
      border-color: var(--border-hover);
      background: var(--bg-tertiary);
    }

    .time-spinner {
      position: absolute;
      right: 4px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      pointer-events: none;
    }

    .spinner-btn {
      background: transparent;
      border: none;
      color: var(--text-primary);
      font-size: 0.6rem;
      line-height: 1;
      padding: 2px 4px;
      cursor: pointer;
      pointer-events: all;
      opacity: 0.7;
      transition: opacity 0.2s ease;
    }

    .spinner-btn:hover {
      opacity: 1;
    }

    .spinner-btn:active {
      opacity: 0.5;
    }

    .time-separator {
      color: #ffffff;
      font-size: 1.2rem;
      font-weight: 600;
      margin-top: 20px;
    }

    .picker-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }

    .picker-btn {
      padding: 8px 20px;
      background: transparent;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      color: #ffffff;
      font-size: 0.8rem;
      font-weight: 500;
      font-family: 'Montserrat', sans-serif;
      cursor: pointer;
      transition: all 0.2s ease;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .picker-btn:hover {
      background: var(--bg-tertiary);
      border-color: var(--border-hover);
    }

    .picker-btn.primary {
      background: var(--text-primary);
      border-color: var(--text-primary);
      color: var(--bg-primary);
    }

    .picker-btn.primary:hover {
      background: var(--text-secondary);
      border-color: var(--text-secondary);
    }
  `]
})
export class DatetimePickerComponent implements OnInit, OnChanges {
  @Input() value: string = '';
  @Input() placeholder: string = 'YYYY-MM-DD HH:MM:SS';
  @Input() isOpen: boolean = false;
  @Output() valueChange = new EventEmitter<string>();
  @Output() opened = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  showPicker: boolean = false;
  currentMonth: Date = new Date();
  selectedDate: Date | null = null;
  hour: number = 0;
  minute: number = 0;
  second: number = 0;
  weekDays: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  monthNames: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  ngOnInit(): void {
    // Close pickers when clicking outside
    document.addEventListener('click', this.handleDocumentClick.bind(this));
    
    // Parse initial value if provided
    if (this.value) {
      this.parseValue(this.value);
    }
  }

  ngOnChanges(): void {
    // Sync showPicker with isOpen input
    if (this.isOpen !== this.showPicker) {
      this.showPicker = this.isOpen;
    }
    
    // Parse value when it changes from parent
    if (this.value) {
      this.parseValue(this.value);
    } else if (this.value === '') {
      // Clear selection if value is cleared
      this.selectedDate = null;
      this.hour = 0;
      this.minute = 0;
      this.second = 0;
    }
  }

  openPicker(): void {
    if (!this.showPicker) {
      this.showPicker = true;
      // Parse value when opening picker if it exists
      if (this.value) {
        this.parseValue(this.value);
      } else if (!this.selectedDate) {
        // If no value and no selected date, initialize with current date/time
        const now = new Date();
        this.selectedDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        this.currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        this.hour = now.getHours();
        this.minute = now.getMinutes();
        this.second = now.getSeconds();
      }
      this.opened.emit();
    }
  }

  closePicker(): void {
    if (this.showPicker) {
      this.showPicker = false;
      this.closed.emit();
    }
  }

  handleDocumentClick(event: MouseEvent): void {
    // Don't close if clicking inside the picker or wrapper
    const target = event.target as HTMLElement;
    if (!target) return;
    
    const pickerWrapper = target.closest('.datetime-picker-wrapper');
    const picker = target.closest('.datetime-picker');
    
    // Only close if clicking outside both the wrapper and the picker itself
    if (!pickerWrapper && !picker) {
      this.closePicker();
    }
  }

  parseValue(value: string): void {
    if (!value) {
      this.selectedDate = null;
      this.hour = 0;
      this.minute = 0;
      this.second = 0;
      return;
    }
    
    try {
      const [datePart, timePart] = value.split(' ');
      if (datePart) {
        const [year, month, day] = datePart.split('-').map(Number);
        
        if (year && month && day) {
          this.selectedDate = new Date(year, month - 1, day);
          this.currentMonth = new Date(year, month - 1, 1);
          
          // Parse time if provided
          if (timePart) {
            const [hour, minute, second] = timePart.split(':').map(Number);
            this.hour = isNaN(hour) ? 0 : hour;
            this.minute = isNaN(minute) ? 0 : minute;
            this.second = isNaN(second) ? 0 : second;
          } else {
            // Default to midnight if no time provided
            this.hour = 0;
            this.minute = 0;
            this.second = 0;
          }
        }
      }
    } catch (e) {
      // Invalid format, ignore
      console.warn('Failed to parse date value:', value, e);
    }
  }

  previousMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
  }

  nextMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
  }

  getMonthYear(): string {
    return `${this.monthNames[this.currentMonth.getMonth()]} ${this.currentMonth.getFullYear()}`;
  }

  getCalendarDays(): Array<{day: number, date: Date, otherMonth: boolean}> {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(year, month, 1);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: Array<{day: number, date: Date, otherMonth: boolean}> = [];
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
      // Normalize time to midnight for accurate comparison
      date.setHours(0, 0, 0, 0);
      days.push({
        day: date.getDate(),
        date: date,
        otherMonth: date.getMonth() !== month
      });
    }
    
    return days;
  }

  normalizeDate(date: Date): Date {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  }

  isToday(date: Date): boolean {
    const today = this.normalizeDate(new Date());
    const checkDate = this.normalizeDate(date);
    return checkDate.getTime() === today.getTime();
  }

  isDateSelected(date: Date): boolean {
    if (!this.selectedDate) return false;
    const normalizedDate = this.normalizeDate(date);
    const normalizedSelected = this.normalizeDate(this.selectedDate);
    return normalizedDate.getTime() === normalizedSelected.getTime();
  }

  selectDate(date: Date): void {
    const normalized = this.normalizeDate(date);
    this.selectedDate = new Date(normalized);
    // If no time is set yet, keep existing time or default to 00:00:00
    // Don't automatically set to current time - let user set it manually
    if (this.selectedDate && this.hour === 0 && this.minute === 0 && this.second === 0 && !this.value) {
      // Only set to midnight if there's no existing value
      this.hour = 0;
      this.minute = 0;
      this.second = 0;
    }
    this.updateDateTime();
  }

  incrementHour(): void {
    this.hour = (this.hour + 1) % 24;
    this.updateDateTime();
  }

  decrementHour(): void {
    this.hour = (this.hour - 1 + 24) % 24;
    this.updateDateTime();
  }

  incrementMinute(): void {
    this.minute = (this.minute + 1) % 60;
    this.updateDateTime();
  }

  decrementMinute(): void {
    this.minute = (this.minute - 1 + 60) % 60;
    this.updateDateTime();
  }

  incrementSecond(): void {
    this.second = (this.second + 1) % 60;
    this.updateDateTime();
  }

  decrementSecond(): void {
    this.second = (this.second - 1 + 60) % 60;
    this.updateDateTime();
  }

  updateDateTime(): void {
    if (this.selectedDate) {
      const date = new Date(this.selectedDate);
      date.setHours(this.hour, this.minute, this.second);
      const formatted = this.formatDateTime(date);
      this.valueChange.emit(formatted);
    }
  }

  formatDateTime(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  }

  applyDate(): void {
    if (this.selectedDate) {
      this.updateDateTime();
    }
    this.closePicker();
  }

  clearDate(): void {
    this.valueChange.emit('');
    this.selectedDate = null;
    this.hour = 0;
    this.minute = 0;
    this.second = 0;
    this.closePicker();
  }

  onBlur(): void {
    // Don't close on blur - let document click handler manage it
  }
}

