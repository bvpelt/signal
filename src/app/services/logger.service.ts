import { Injectable, signal } from '@angular/core';
import { Logmessage, Severity } from '../data/logmessage';

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  private logMessages = signal<Logmessage[]>([]);

  // Return readonly signal for components to consume
  allOrders() {
    return this.logMessages();
  }

  // Main logging method
  log(module: string, message: string, severity: Severity = 'info'): void {
    const logMessage: Logmessage = {
      module,
      severity,
      message,
      timestamp: new Date(),
    };

    this.logMessages.update((messages) => [...messages, logMessage]);
  }

  // Convenience methods for different severity levels
  debug(module: string, message: string): void {
    this.log(module, message, 'debug');
  }

  info(module: string, message: string): void {
    this.log(module, message, 'info');
  }

  warning(module: string, message: string): void {
    this.log(module, message, 'warning');
  }

  error(module: string, message: string): void {
    this.log(module, message, 'error');
  }

  // Clear all log messages
  clear(): void {
    this.logMessages.set([]);
  }

  // Get count of messages by severity
  getCountBySeverity(severity: Severity): number {
    return this.logMessages().filter((log) => log.severity === severity).length;
  }
}
