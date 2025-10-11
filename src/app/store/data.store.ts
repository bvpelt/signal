import { Card } from '../data/card';
import { Order } from '../data/order';
import { Catagory } from '../data/catagory';
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

type DataState = {
  categories: Catagory[];
  cards: Card[];
  orders: Order[];
  selectedCategoryId: number | null; // null means "All"
  loadingCategories: boolean;
  loadingCards: boolean;
  loadingOrders: boolean;
};

const initialState: DataState = {
  categories: [],
  cards: [],
  orders: [],
  selectedCategoryId: null, // Show all by default
  loadingCategories: false,
  loadingCards: false,
  loadingOrders: false,
};

export const DataStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => {
    // First, create the sorted cards computed
    const sortedCards = computed(() => {
      const selectedCategoryId = store.selectedCategoryId();
      let cards = [...store.cards()];
      
      // Filter by category if one is selected
      if (selectedCategoryId !== null) {
        cards = cards.filter(card => card.catagoryId === selectedCategoryId);
      }
      
      // Sort by title
      return cards.sort((a, b) => a.title.localeCompare(b.title));
    });

    return {
      sortedCards,
      
      // Sorted orders computed signal
      sortedOrders: computed(() => {
        return [...store.orders()].sort((a, b) =>
          a.description.localeCompare(b.description),
        );
      }),
      
      // Computed counts - now can reference sortedCards
      cardCount: computed(() => sortedCards().length), // Count filtered cards
      totalCardCount: computed(() => store.cards().length), // Total cards
      categoryCount: computed(() => store.categories().length),
      orderCount: computed(() => store.orders().length),
      
      // Get category name for selected category
      selectedCategoryName: computed(() => {
        const selectedId = store.selectedCategoryId();
        if (selectedId === null) return 'All';
        const category = store.categories().find(c => c.id === selectedId);
        return category?.name ?? 'Unknown';
      }),
    };
  }),
  withMethods((store) => {
    const cardService = inject(CardsService);
    const orderService = inject(OrdersService);
    const loggerService = inject(LoggerService);
    const catagoryService = inject(CatagoryService);

    return {
      async loadAllCategories(): Promise<void> {
        loggerService.debug('DataStore', 'Loading all categories');
        patchState(store, { loadingCategories: true });
        const categories = await catagoryService.getCategories();
        patchState(store, { categories, loadingCategories: false });
        loggerService.info('DataStore', `Loaded ${categories.length} categories`);
      },
      
      async loadAllCards(): Promise<void> {
        loggerService.debug('DataStore', 'Loading all cards');
        patchState(store, { loadingCards: true });
        const cards = await cardService.getCards();
        patchState(store, { cards, loadingCards: false });
        loggerService.info('DataStore', `Loaded ${cards.length} cards`);
      },
      
      async loadAllOrders(): Promise<void> {
        loggerService.debug('DataStore', 'Loading all orders');
        patchState(store, { loadingOrders: true });
        const orders = await orderService.getOrders();
        patchState(store, { orders, loadingOrders: false });
        loggerService.info('DataStore', `Loaded ${orders.length} orders`);
      },
      
      // Set selected category filter
      selectCategory(categoryId: number | null): void {
        loggerService.debug('DataStore', `Selecting category: ${categoryId ?? 'All'}`);
        patchState(store, { selectedCategoryId: categoryId });
      },
      
      // Clear category filter (show all)
      clearCategoryFilter(): void {
        loggerService.debug('DataStore', 'Clearing category filter');
        patchState(store, { selectedCategoryId: null });
      },
      
      async addToShoppingCard(card: Card): Promise<void> {
        loggerService.debug(
          'DataStore',
          'addToShoppingCard card: ' + JSON.stringify(card),
        );
        const customer: number = 1;
        const orders = await orderService.addCardToOrder(customer, card);
        patchState(store, { orders: orders() });
      },
      
      async removeCardFromOrder(card: Card): Promise<void> {
        loggerService.debug(
          'DataStore',
          'removeCardFromOrder card: ' + JSON.stringify(card),
        );
        const customer: number = 1;
        await orderService.removeCardFromOrder(customer, card);

        // Fetch updated orders from the service
        const orders = await orderService.getOrders();
        patchState(store, { orders });
      },
      
      // Update card data
      async updateCard(card: Card): Promise<void> {
        loggerService.debug('DataStore', `Updating card: ${card.title}`);
        patchState(store, { loadingCards: true });
        
        // Update the card in the service
        await cardService.updateCard(card);
        
        // Reload all cards to get the updated data
        const cards = await cardService.getCards();
        patchState(store, { cards, loadingCards: false });
        loggerService.info('DataStore', `Card updated: ${card.title}`);
      },
    };
  }),
);