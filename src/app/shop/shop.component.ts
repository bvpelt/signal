import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  computed,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Card } from '../data/card';
import { DataStore } from '../store/data.store';
import { OrdersService } from '../services/orders.service';
import { OrdercardComponent } from '../ordercard/ordercard.component';
import { CatagoryComponent } from '../catagory/catagory.component';
import { LoggerService } from '../services/logger.service';

@Component({
  selector: 'app-shop',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [OrdercardComponent, CatagoryComponent, FormsModule],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss',
})
export class ShopComponent implements OnInit {
  dataStore = inject(DataStore);
  orderService = inject(OrdersService);
  loggerService = inject(LoggerService);

  customerId = 1;

  // Edit state
  editingCardId = signal<number | null>(null);
  editForm: {
    title: string;
    description: string;
    price: number;
    image: string;
    catagoryId: number;
  } = {
    title: '',
    description: '',
    price: 0,
    image: '',
    catagoryId: 1,
  };

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

  // Edit functionality
  startEdit(card: Card): void {
    this.editingCardId.set(card.id);
    this.editForm = {
      title: card.title,
      description: card.description,
      price: card.price,
      image: card.image,
      catagoryId: card.catagoryId,
    };
    this.loggerService.debug(
      'ShopComponent',
      `Started editing card: ${card.title}`,
    );
  }

  cancelEdit(): void {
    this.editingCardId.set(null);
    this.loggerService.debug('ShopComponent', 'Cancelled editing');
  }

  async saveCard(): Promise<void> {
    const cardId = this.editingCardId();
    if (cardId === null) return;

    const originalCard = this.dataStore.cards().find((c) => c.id === cardId);
    this.loggerService.info(
      'ShopComponent',
      'Original Card: ' + JSON.stringify(originalCard),
    );

    if (!originalCard) return;

    const updatedCard: Card = {
      id: cardId,
      title: this.editForm.title,
      description: this.editForm.description,
      price: this.editForm.price,
      image: this.editForm.image,
      catagoryId: this.editForm.catagoryId,
      quantity: originalCard.quantity,
    };
    this.loggerService.info(
      'ShopComponent',
      'Updated Card: ' + JSON.stringify(updatedCard),
    );

    await this.dataStore.updateCard(updatedCard);
    this.editingCardId.set(null);

    const categoryName =
      this.dataStore.categories().find((c) => c.id === updatedCard.catagoryId)
        ?.name ?? 'Unknown';
    this.loggerService.info(
      'ShopComponent',
      `Updated card: ${updatedCard.title} (Category: ${categoryName})`,
    );
  }
}
