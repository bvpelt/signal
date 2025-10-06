import { Card } from '../data/card';
import { Order } from '../data/order';
import { computed, inject } from '@angular/core';
import { patchState, withState, signalStore, withMethods, withComputed } from '@ngrx/signals';
import { CardsService } from '../services/cards.service';
import { OrdersService } from '../services/orders.service';
import { LoggerService } from '../services/logger.service';

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
  withState(initialState), // initial state
  withComputed((store) => ({
    // Sorted cards computed signal
    sortedCards: computed(() => {
      return [...store.cards()].sort((a, b) => 
        a.title.localeCompare(b.title)
      );
    }),
    // You can add more computed properties
    cardCount: computed(() => store.cards().length),
    orderCount: computed(() => store.orders().length),
  })),
  withMethods((store) => {
    const cardService = inject(CardsService);
    const orderService = inject(OrdersService);
    const loggerService = inject(LoggerService);

    return {
      async loadAllCards() {
        loggerService.debug('DataStore', 'Loading all cards');
        patchState(store, { loading: true }); // partial update of the state
        const cards = await cardService.getCards();
        patchState(store, { cards, loading: false });
      },
      async loadAllOrders() {
        loggerService.debug('DataStore', 'Loading all orders');
        patchState(store, { loading: true }); // partial update of the state
        const orders = await orderService.getOrders();
        patchState(store, { orders, loading: false });
      },
      async addToShoppingCard(card: Card) {
        loggerService.debug(
          'DataStore',
          'addToShoppingCard card: ' + JSON.stringify(card),
        );
        var customer: number = 1;
        const orders = await orderService.addCardToOrder(customer, card);
        patchState(store, { orders: orders() });
      },
      async removeCardFromOrder(card: Card) {
          loggerService.debug(
          'DataStore',
          'removeCardFromOrder card: ' + JSON.stringify(card),
        );
        const customer: number = 1;
        await orderService.removeCardFromOrder(customer, card);

        // Haal bijgewerkte orders op uit de service
        const orders = await orderService.getOrders();
        patchState(store, { orders });
      },
    };
  }),
);
