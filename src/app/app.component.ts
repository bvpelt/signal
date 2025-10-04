import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { RouterOutlet, RouterLinkActive } from '@angular/router';
import { LoggerComponent } from './logger/logger.component';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule, LoggerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'signal';
}
