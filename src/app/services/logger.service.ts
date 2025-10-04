import { Injectable, signal } from '@angular/core';
import { Logmessage, Severity } from '../data/logmesage';

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  private messages = signal<Logmessage[]>([]);

  // Readonly signal voor externe toegang
  readonly allOrders = this.messages.asReadonly();

  constructor() {}

  log(module: string, message: string, severity: Severity = 'info'): void {
    const logMessage: Logmessage = {
      module,
      severity, // Make sure this is included
      message,
      timestamp: new Date(),
    };

    this.messages.update((messages) => [...messages, logMessage]);
  }

  // Convenience methods
  info(module: string, message: string): void {
    this.log(module, message, 'info');
  }

  warning(module: string, message: string): void {
    this.log(module, message, 'warning');
  }

  error(module: string, message: string): void {
    this.log(module, message, 'error');
  }

  clear(): void {
    this.messages.set([]);
  }
}
