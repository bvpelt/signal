import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  computed,
  signal,
} from '@angular/core';
import { Card } from '../data/card';
import { DataStore } from '../store/data.store';
import { OrdersService } from '../services/orders.service';
import { OrdercardComponent } from '../ordercard/ordercard.component';
import { CatagoryComponent } from '../catagory/catagory.component';
import { LoggerService } from '../services/logger.service';
import {
  EditCardComponent,
  CardFormData,
} from '../edit-card/edit-card.component';

@Component({
  selector: 'app-shop',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [OrdercardComponent, CatagoryComponent, EditCardComponent],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss',
})
export class ShopComponent implements OnInit {
  dataStore = inject(DataStore);
  orderService = inject(OrdersService);
  loggerService = inject(LoggerService);

  customerId = 1;

  // Edit/Add state
  editingCardId = signal<number | null>(null);
  isAddingNew = computed(() => this.editingCardId() === -1);

  // Get the card being edited
  editingCard = computed(() => {
    const cardId = this.editingCardId();
    if (cardId === null || cardId === -1) return null;
    return this.dataStore.cards().find((c) => c.id === cardId) ?? null;
  });

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

  async ngOnInit(): Promise<void> {
    await this.dataStore.loadAllCategories();
    await this.dataStore.loadAllCards();
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

  // Start adding a new card
  startAddNew(): void {
    this.editingCardId.set(-1);
    this.loggerService.debug('ShopComponent', 'Started adding new card');
  }

  // Start editing an existing card
  startEdit(card: Card): void {
    this.editingCardId.set(card.id);
    const categoryName =
      this.dataStore.categories().find((c) => c.id === card.catagoryId)?.name ??
      'Unknown';

    this.loggerService.debug(
      'ShopComponent',
      `Started editing card: ${card.title} (Category: ${categoryName})`,
    );
  }

  // Cancel editing/adding
  cancelEdit(): void {
    this.editingCardId.set(null);
    this.loggerService.debug('ShopComponent', 'Cancelled editing/adding');
  }

  // Handle save from EditCardComponent
  async onSaveCard(formData: CardFormData): Promise<void> {
    const cardId = this.editingCardId();
    if (cardId === null) return;

    if (cardId === -1) {
      await this.addNewCard(formData);
    } else {
      await this.updateExistingCard(cardId, formData);
    }
  }

  private async addNewCard(formData: CardFormData): Promise<void> {
    const newCard: Omit<Card, 'id'> = {
      ...formData,
      quantity: 0,
    };

    try {
      const addedCard = await this.dataStore.addCard(newCard);

      this.editingCardId.set(null);

      const categoryName =
        this.dataStore.categories().find((c) => c.id === addedCard.catagoryId)
          ?.name ?? 'Unknown';

      this.loggerService.info(
        'ShopComponent',
        `Added new card: ${addedCard.title} (Category: ${categoryName})`,
      );
    } catch (error) {
      this.loggerService.error('ShopComponent', `Failed to add card: ${error}`);
    }
  }

  private async updateExistingCard(
    cardId: number,
    formData: CardFormData,
  ): Promise<void> {
    const originalCard = this.dataStore.cards().find((c) => c.id === cardId);
    if (!originalCard) {
      this.loggerService.warning(
        'ShopComponent',
        `Card with ID ${cardId} not found`,
      );
      return;
    }

    const updatedCard: Card = {
      id: cardId,
      ...formData,
      quantity: originalCard.quantity,
    };

    try {
      await this.dataStore.updateCard(updatedCard);

      this.editingCardId.set(null);

      const categoryName =
        this.dataStore.categories().find((c) => c.id === updatedCard.catagoryId)
          ?.name ?? 'Unknown';

      this.loggerService.info(
        'ShopComponent',
        `Updated card: ${updatedCard.title} (Category: ${categoryName})`,
      );
    } catch (error) {
      this.loggerService.error(
        'ShopComponent',
        `Failed to update card: ${error}`,
      );
    }
  }
}
