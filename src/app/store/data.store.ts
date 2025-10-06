import { Card } from '../data/card';
import { Order } from '../data/order';
import { computed, inject } from '@angular/core';
import {
  patchState,
  withState,
  signalStore,
  withMethods,
  withComputed,
} from '@ngrx/signals';
import { CardsService } from '../services/cards.service';
import { OrdersService } from '../services/orders.service';
import { LoggerService } from '../services/logger.service';
import { CatagoryService } from '../services/catagory.service';
import { Catagory } from '../data/catagory';

type DataState = {
  categories: Catagory[];
  cards: Card[];
  orders: Order[];
  loadingCategories: boolean,
  loadingCards: boolean,
  loadingOrders: boolean,
};

const initialState: DataState = {
  categories: [],
  cards: [],
  orders: [],
  loadingCategories: false,
  loadingCards: false,
  loadingOrders: false,
};

export const DataStore = signalStore(
  { providedIn: 'root' },
  withState(initialState), // initial state
  withComputed((store) => ({
    // Sorted cards computed signal
    sortedCards: computed(() => {
      return [...store.cards()].sort((a, b) => a.title.localeCompare(b.title));
    }),
    // Sorted orders computed signal
    sortedOrders: computed(() => {
      return [...store.orders()].sort((a, b) =>
        a.description.localeCompare(b.description),
      );
    }),
    // You can add more computed properties
    cardCount: computed(() => store.cards().length),
    categoryCount: computed(() => store.categories().length),
    orderCount: computed(() => store.orders().length),
  })),
  withMethods((store) => {
    const cardService = inject(CardsService);
    const orderService = inject(OrdersService);
    const loggerService = inject(LoggerService);
    const catagoryService = inject(CatagoryService);

    return {
        async loadAllCategories() {
        loggerService.debug('DataStore', 'Loading all categories');
        patchState(store, { loadingCategories: true }); // partial update of the state
        const categories = await catagoryService.getCategories();
        patchState(store, { categories, loadingCategories: false });
      },
      async loadAllCards() {
        loggerService.debug('DataStore', 'Loading all cards');
        patchState(store, { loadingCards: true }); // partial update of the state
        const cards = await cardService.getCards();
        patchState(store, { cards, loadingCards: false });
      },
      async loadAllOrders() {
        loggerService.debug('DataStore', 'Loading all orders');
        patchState(store, { loadingOrders: true }); // partial update of the state
        const orders = await orderService.getOrders();
        patchState(store, { orders, loadingOrders: false });
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
