import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  computed,
} from '@angular/core';
import { Card } from '../data/card';
import { DataStore } from '../store/data.store';
import { OrdersService } from '../services/orders.service';
import { OrdercardComponent } from '../ordercard/ordercard.component';
import { CatagoryComponent } from '../catagory/catagory.component';
import { LoggerService } from '../services/logger.service';

@Component({
  selector: 'app-shop',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [OrdercardComponent, CatagoryComponent],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss',
})
export class ShopComponent implements OnInit {
  dataStore = inject(DataStore);
  orderService = inject(OrdersService);
  loggerService = inject(LoggerService);

  customerId = 1;

  // Computed map for better performance
  orderedQuantities = computed(() => {
    const quantities = new Map<number, number>();
    this.orderService.allOrders().forEach((order) => {
      if (order.customerid === this.customerId) {
        quantities.set(order.artikelid, order.quantity);
      }
    });
    return quantities;
  });

  ngOnInit(): void {
    this.dataStore.loadAllCards();
    this.dataStore.loadAllCategories();
    this.loggerService.info('ShopComponent', 'Shop component initialized');
  }

  addToShoppingCard(card: Card): void {
    this.dataStore.addToShoppingCard(card);
    this.loggerService.debug(
      'ShopComponent',
      `Added ${card.title} to shopping card`,
    );
  }

  removeCardFromOrder(card: Card): void {
    this.dataStore.removeCardFromOrder(card);
    this.loggerService.debug(
      'ShopComponent',
      `Removed ${card.title} from order`,
    );
  }

  getOrderedQuantity(cardId: number): number {
    return this.orderedQuantities().get(cardId) ?? 0;
  }
}
