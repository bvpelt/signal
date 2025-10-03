import { Component, OnInit, inject } from '@angular/core';
import { Card } from '../data/card';
import { CardsService } from '../services/cards.service';
import { DataStore } from '../store/data.store';
import { OrdersService } from '../services/orders.service';
import { OrdercardComponent } from '../ordercard/ordercard.component';

@Component({
  selector: 'app-shop',
  imports: [OrdercardComponent],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss',
})
export class ShopComponent implements OnInit {
  dataStore = inject(DataStore);
  cards = this.dataStore.cards;
  customerId = 1; // Of haal op uit auth service

  constructor(
    private cardsService: CardsService,
    private orderService: OrdersService,
  ) {}

  ngOnInit() {
    this.dataStore.loadAllCards();
    console.log('ngOnInit: ', this.dataStore.cards());
  }

  addToShoppingCard(card: Card) {
    console.log('ShopComponent addToShoppingCard: ', card);
    this.dataStore.addToShoppingCard(card);
  }

  removeCardFromOrder(card: Card) {
    this.dataStore.removeCardFromOrder(card);
  }

  // Haal de quantity op uit de orders voor een specifieke card
  getOrderedQuantity(cardId: number): number {
    const order = this.orderService
      .allOrders()
      .find(
        (order) =>
          order.customerid === this.customerId && order.artikelid === cardId,
      );
    return order ? order.quantity : 0;
  }
}
