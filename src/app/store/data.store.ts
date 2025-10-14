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
  selectedCategoryId: number | null;
  loadingCategories: boolean;
  loadingCards: boolean;
  loadingOrders: boolean;
};

const initialState: DataState = {
  categories: [],
  cards: [],
  orders: [],
  selectedCategoryId: null,
  loadingCategories: false,
  loadingCards: false,
  loadingOrders: false,
};

export const DataStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => {
    const sortedCards = computed(() => {
      const selectedCategoryId = store.selectedCategoryId();
      let cards = [...store.cards()];

      if (selectedCategoryId !== null) {
        cards = cards.filter((card) => card.catagoryId === selectedCategoryId);
      }

      return cards.sort((a, b) => a.title.localeCompare(b.title));
    });

    return {
      sortedCards,

      sortedOrders: computed(() => {
        return [...store.orders()].sort((a, b) =>
          a.description.localeCompare(b.description),
        );
      }),

      cardCount: computed(() => sortedCards().length),
      totalCardCount: computed(() => store.cards().length),
      categoryCount: computed(() => store.categories().length),
      orderCount: computed(() => store.orders().length),

      selectedCategoryName: computed(() => {
        const selectedId = store.selectedCategoryId();
        if (selectedId === null) return 'All';
        const category = store.categories().find((c) => c.id === selectedId);
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
        loggerService.trace(
          'DataStore',
          `Loaded ${categories.length} categories`,
        );
      },

      selectCategory(categoryId: number | null): void {
        loggerService.trace(
          'DataStore',
          `Selecting category: ${categoryId ?? 'All'}`,
        );

        if (categoryId !== null) {
          const cardsBeforeFilter = store.cards();
          loggerService.trace(
            'DataStore',
            `Total cards in store: ${cardsBeforeFilter.length}`,
          );

          const filteredCards = cardsBeforeFilter.filter(
            (card) => card.catagoryId === categoryId,
          );
          loggerService.trace(
            'DataStore',
            `Cards matching category ${categoryId}: ${filteredCards.length}`,
          );

          // Log the actual cards for debugging
          filteredCards.forEach((card) => {
            loggerService.trace(
              'DataStore',
              `  - ${card.title} (ID: ${card.id}, Category: ${card.catagoryId})`,
            );
          });
        }

        patchState(store, { selectedCategoryId: categoryId });
      },

      clearCategoryFilter(): void {
        loggerService.debug('DataStore', 'Clearing category filter');
        patchState(store, { selectedCategoryId: null });
      },

      async loadAllCards(): Promise<void> {
        loggerService.debug('DataStore', 'Loading all cards');
        patchState(store, { loadingCards: true });
        const cards = await cardService.getCards();
        patchState(store, { cards, loadingCards: false });
        loggerService.trace('DataStore', `Loaded ${cards.length} cards`);
      },

      async updateCard(card: Card): Promise<void> {
        loggerService.debug(
          'DataStore',
          `Updating card: ${card.title} (ID: ${card.id}, Category: ${card.catagoryId})`,
        );
        patchState(store, { loadingCards: true });

        try {
          await cardService.updateCard(card);

          const updatedCards = await cardService.getCards();

          loggerService.trace(
            'DataStore',
            `Cards reloaded after update: ${updatedCards.length} cards`,
          );

          const verifyCard = updatedCards.find((c) => c.id === card.id);
          if (verifyCard) {
            loggerService.trace(
              'DataStore',
              `Verified updated card: ${verifyCard.title} (Category: ${verifyCard.catagoryId})`,
            );
          }

          patchState(store, { cards: updatedCards, loadingCards: false });

          loggerService.trace(
            'DataStore',
            `Card updated successfully: ${card.title} (Category: ${card.catagoryId})`,
          );
        } catch (error) {
          loggerService.error('DataStore', `Failed to update card: ${error}`);
          patchState(store, { loadingCards: false });
          throw error;
        }
      },

      async addCard(newCard: Omit<Card, 'id'>): Promise<Card> {
        loggerService.debug('DataStore', `Adding new card: ${newCard.title}`);
        patchState(store, { loadingCards: true });

        try {
          const addedCard = await cardService.addCard(newCard);
          const cards = await cardService.getCards();
          patchState(store, { cards, loadingCards: false });

          loggerService.trace(
            'DataStore',
            `Card added successfully: ${addedCard.title}`,
          );
          return addedCard;
        } catch (error) {
          loggerService.error('DataStore', `Failed to add card: ${error}`);
          patchState(store, { loadingCards: false });
          throw error;
        }
      },

      async deleteCard(cardId: number): Promise<void> {
        loggerService.debug('DataStore', `Deleting card with ID: ${cardId}`);
        patchState(store, { loadingCards: true });

        try {
          await cardService.deleteCard(cardId);
          const cards = await cardService.getCards();
          patchState(store, { cards, loadingCards: false });

          loggerService.debug(
            'DataStore',
            `Card deleted successfully: ${cardId}`,
          );
        } catch (error) {
          loggerService.error('DataStore', `Failed to delete card: ${error}`);
          patchState(store, { loadingCards: false });
          throw error;
        }
      },

      async searchCards(searchTerm: string): Promise<void> {
        loggerService.debug('DataStore', `Searching cards for: ${searchTerm}`);
        patchState(store, { loadingCards: true });

        try {
          const cards = await cardService.searchCards(searchTerm);
          patchState(store, { cards, loadingCards: false });
          loggerService.trace(
            'DataStore',
            `Search returned ${cards.length} cards`,
          );
        } catch (error) {
          loggerService.error('DataStore', `Search failed: ${error}`);
          patchState(store, { loadingCards: false });
          throw error;
        }
      },

      async loadAllOrders(): Promise<void> {
        loggerService.debug('DataStore', 'Loading all orders');
        patchState(store, { loadingOrders: true });
        const orders = await orderService.getOrders();
        patchState(store, { orders, loadingOrders: false });
        loggerService.trace('DataStore', `Loaded ${orders.length} orders`);
      },

      async addToShoppingCard(card: Card): Promise<void> {
        loggerService.debug(
          'DataStore',
          'addToShoppingCard card: ' + JSON.stringify(card),
        );

        try {
          const customer: number = 1;
          const orders = await orderService.addCardToOrder(customer, card);
          patchState(store, { orders: orders() });
          loggerService.debug(
            'DataStore',
            `Added ${card.title} to shopping cart`,
          );
        } catch (error) {
          loggerService.error('DataStore', `Failed to add to cart: ${error}`);
          throw error;
        }
      },

      async removeCardFromOrder(card: Card): Promise<void> {
        loggerService.debug(
          'DataStore',
          'removeCardFromOrder card: ' + JSON.stringify(card),
        );

        try {
          const customer: number = 1;
          await orderService.removeCardFromOrder(customer, card);

          const orders = await orderService.getOrders();
          patchState(store, { orders });
          loggerService.debug('DataStore', `Removed ${card.title} from cart`);
        } catch (error) {
          loggerService.error(
            'DataStore',
            `Failed to remove from cart: ${error}`,
          );
          throw error;
        }
      },

      clearOrders(): void {
        loggerService.debug('DataStore', 'Clearing all orders');
        patchState(store, { orders: [] });
        loggerService.info('DataStore', 'All orders cleared');
      },

      resetStore(): void {
        loggerService.warning('DataStore', 'Resetting store to initial state');
        patchState(store, initialState);
      },
    };
  }),
);
