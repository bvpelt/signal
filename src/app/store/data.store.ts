import { Card } from '../data/card';
import { Order } from '../data/order';
import { computed, inject } from '@angular/core';
import { patchState, withState, signalStore, withMethods } from '@ngrx/signals';
import { CardsService } from '../services/cards.service';
import { OrdersService } from '../services/orders.service';

type DataState = {
  cards: Card[];
  orders: Order[];
  loading: boolean;
};

const initialState: DataState = {
  cards: [],
  orders: [],
  loading: false,
};

export const DataStore = signalStore(
  { providedIn: 'root' },
  withState(initialState), // state
  withMethods((store) => {
    const cardService = inject(CardsService);
    const orderService = inject(OrdersService);

    return {
      async loadAllCards() {
        patchState(store, { loading: true }); // partial update of the state
        const cards = await cardService.getCards();
        patchState(store, { cards, loading: false });
      },
      async loadAllOrders() {
        patchState(store, { loading: true }); // partial update of the state
        const orders = await orderService.getOrders();
        patchState(store, { orders, loading: false });
      },
      async addToShoppingCard(card: Card) {
        console.log('dataStore addToShoppingCard: ', card);
        var customer: number = 1;
        const order = await orderService.addCardToOrder(customer, card);
        patchState(store, (state) => ({
          orders: [...state.orders, order],
        }));
        console.log('dataStore addToShoppingCard orders: ', store.orders());
      },
      async removeCardFromOrder(card: Card) {
        const customer: number = 1;
        await orderService.removeCardFromOrder(customer, card);

        // Haal bijgewerkte orders op uit de service
        const orders = await orderService.getOrders();
        patchState(store, { orders });
      },
    };
  })
);
