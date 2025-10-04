import { Component } from '@angular/core';
import { LoggerService } from '../services/logger.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-logger',
  imports: [DatePipe],
  templateUrl: './logger.component.html',
  styleUrl: './logger.component.scss',
})
export class LoggerComponent {
  constructor(private loggerService: LoggerService) {}

  get logMessages() {
    return this.loggerService.allOrders();
  }
}
