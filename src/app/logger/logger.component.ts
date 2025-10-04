import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { LoggerService } from '../services/logger.service';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { Severity } from '../data/logmessage';
//import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-logger',
  changeDetection: ChangeDetectionStrategy.OnPush,
//  imports: [DatePipe, MatCheckboxModule, FormsModule],
  imports: [DatePipe, UpperCasePipe,FormsModule],
  templateUrl: './logger.component.html',
  styleUrl: './logger.component.scss',
})
export class LoggerComponent {
  private loggerService = inject(LoggerService);

  // Track which severities are selected
  selectedSeverities = signal<Set<Severity>>(new Set(['debug', 'info', 'warning', 'error']));

  // Computed filtered log messages
  logMessages = computed(() => {
    const allLogs = this.loggerService.allOrders();
    const selected = this.selectedSeverities();
    
    return allLogs.filter(log => selected.has(log.severity));
  });

  // Toggle severity filter
  toggleSeverity(severity: Severity): void {
    this.selectedSeverities.update(current => {
      const updated = new Set(current);
      if (updated.has(severity)) {
        updated.delete(severity);
      } else {
        updated.add(severity);
      }
      return updated;
    });
  }

  // Check if severity is selected
  isSeveritySelected(severity: Severity): boolean {
    return this.selectedSeverities().has(severity);
  }

  // Clear all logs
  clearLogs(): void {
    this.loggerService.clear();
  }
}