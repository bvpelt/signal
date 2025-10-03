import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { DataStore } from '../store/data.store';

@Component({
  selector: 'app-ordercard',
  imports: [CurrencyPipe],
  templateUrl: './ordercard.component.html',
  styleUrl: './ordercard.component.scss',
})
export class OrdercardComponent {
  dataStore = inject(DataStore);

  getTotalPrice(): number {
    return this.dataStore
      .orders()
      .reduce((sum, order) => sum + order.quantity * order.price, 0);
  }

  getTotalItems(): number {
    return this.dataStore.orders().length;
  }
}
