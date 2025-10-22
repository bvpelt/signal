import { TestBed } from '@angular/core/testing';
import { DataStore, initialState } from './data.store';
import { CardsService } from '../services/cards.service';
import { OrdersService } from '../services/orders.service';
import { LoggerService } from '../services/logger.service';
import { CatagoryService } from '../services/catagory.service';
import { Card } from '../data/card';
import { Order } from '../data/order';
import { Catagory } from '../data/catagory';
import { signal, WritableSignal } from '@angular/core';

// --- MOCK DATA ---
const MOCK_CATEGORIES: Catagory[] = [
  { id: 1, name: 'Books' },
  { id: 2, name: 'Electronics' },
];

const MOCK_CARDS: Card[] = [
  {
    id: 101,
    title: 'Card A',
    description: 'desc A',
    price: 10,
    image: 'a.png',
    catagoryId: 1,
    quantity: 1,
  },
  {
    id: 102,
    title: 'Card B',
    description: 'desc B',
    price: 20,
    image: 'b.png',
    catagoryId: 2,
    quantity: 2,
  },
  {
    id: 103,
    title: 'Card C',
    description: 'desc C',
    price: 30,
    image: 'c.png',
    catagoryId: 1,
    quantity: 3,
  },
];

const MOCK_ORDERS: Order[] = [
  {
    id: 1,
    customerid: 1,
    artikelid: 101,
    description: 'Order A',
    quantity: 10,
    categoryid: 1,
    price: 10.0,
  },
  {
    id: 2,
    customerid: 1,
    artikelid: 102,
    description: 'Order B',
    quantity: 5,
    categoryid: 2,
    price: 20.0,
  },
];

// --- MOCK SERVICE TYPES ---
type MockCardsService = jasmine.SpyObj<CardsService>;
type MockOrdersService = jasmine.SpyObj<OrdersService> & {
  addCardToOrder: jasmine.Spy<
    (customer: number, card: Card) => Promise<WritableSignal<Order[]>>
  >;
};
type MockLoggerService = jasmine.SpyObj<LoggerService>;
type MockCategoryService = jasmine.SpyObj<CatagoryService>;

describe('DataStore', () => {
  let store: InstanceType<typeof DataStore>;
  let mockCardsService: MockCardsService;
  let mockOrdersService: MockOrdersService;
  let mockLoggerService: MockLoggerService;
  let mockCategoryService: MockCategoryService;

  beforeEach(() => {
    // 1. Create Spy Objects for all dependencies
    mockCardsService = jasmine.createSpyObj('CardsService', [
      'getCards',
      'updateCard',
      'addCard',
      'deleteCard',
      'searchCards',
    ]);
    mockOrdersService = jasmine.createSpyObj('OrdersService', [
      'getOrders',
      'addCardToOrder',
      'removeCardFromOrder',
    ]) as MockOrdersService;
    mockLoggerService = jasmine.createSpyObj('LoggerService', [
      'debug',
      'info',
      'warning',
      'error',
      'trace',
    ]);
    mockCategoryService = jasmine.createSpyObj('CatagoryService', [
      'getCategories',
    ]);

    // 2. Configure Mock Service Responses (Default)
    mockCardsService.getCards.and.resolveTo(MOCK_CARDS);
    mockCategoryService.getCategories.and.resolveTo(MOCK_CATEGORIES);
    mockOrdersService.getOrders.and.resolveTo(MOCK_ORDERS);
    mockOrdersService.addCardToOrder.and.resolveTo(signal([])); // Mock signal return

    // 3. Configure TestBed to provide the Signal Store and Mocks
    TestBed.configureTestingModule({
      providers: [
        // Provide the signal store (Angular dependency injection handles the store creation)
        DataStore,
        // Provide the mock implementations
        { provide: CardsService, useValue: mockCardsService },
        { provide: OrdersService, useValue: mockOrdersService },
        { provide: LoggerService, useValue: mockLoggerService },
        { provide: CatagoryService, useValue: mockCategoryService },
      ],
    });

    // 4. Inject the DataStore instance
    store = TestBed.inject(DataStore);

    // 5. Reset the store state before each test
    store.resetStore();
  });

  // Test reset function to ensure initial state is correct
  it('should be initialized with the correct initial state', () => {
    expect(store.categories()).toEqual([]);
    expect(store.cards()).toEqual([]);
    expect(store.selectedCategoryId()).toBeNull();
    expect(store.loadingCards()).toBeFalse();
  });

  // --- ASYNCHRONOUS METHOD TESTS (LOADERS) ---

  describe('loadAllCategories', () => {
    it('should load categories and update state', async () => {
      await store.loadAllCategories();

      expect(mockCategoryService.getCategories).toHaveBeenCalled();
      expect(store.categories()).toEqual(MOCK_CATEGORIES);
      expect(store.loadingCategories()).toBeFalse();
      expect(mockLoggerService.debug).toHaveBeenCalledWith(
        'DataStore',
        'Loading all categories',
      );
      expect(mockLoggerService.trace).toHaveBeenCalledWith(
        'DataStore',
        jasmine.stringContaining('Loaded 2 categories'),
      );
    });
  });

  describe('loadAllCards', () => {
    it('should load cards and update state', async () => {
      await store.loadAllCards();

      expect(mockCardsService.getCards).toHaveBeenCalled();
      expect(store.cards()).toEqual(MOCK_CARDS);
      expect(store.loadingCards()).toBeFalse();
    });
  });

  describe('loadAllOrders', () => {
    it('should load orders and update state', async () => {
      await store.loadAllOrders();

      expect(mockOrdersService.getOrders).toHaveBeenCalled();
      expect(store.orders()).toEqual(MOCK_ORDERS);
      expect(store.loadingOrders()).toBeFalse();
    });
  });

  // --- SYNCHRONOUS METHOD TESTS (FILTERS) ---

  describe('Category Selection', () => {
    beforeEach(async () => {
      // Load initial data to test filtering against
      await store.loadAllCards();
      await store.loadAllCategories();
    });

    it('selectCategory should set selectedCategoryId and correctly filter computed cards', () => {
      const categoryIdToSelect = 1;
      store.selectCategory(categoryIdToSelect);

      expect(store.selectedCategoryId()).toBe(categoryIdToSelect);
      // 'Card A' and 'Card C' belong to category 1
      expect(store.sortedCards().length).toBe(2);

      // Verify sorting is applied ('Card A', 'Card C')
      expect(store.sortedCards()[0].title).toBe('Card A');

      // Verify logging during filtering
      expect(mockLoggerService.trace).toHaveBeenCalledWith(
        'DataStore',
        jasmine.stringContaining(`Cards matching category 1: 2`),
      );
    });

    it('clearCategoryFilter should set selectedCategoryId to null', () => {
      store.selectCategory(1); // Set a filter first
      store.clearCategoryFilter();

      expect(store.selectedCategoryId()).toBeNull();
      // All 3 cards should be returned when filter is cleared
      expect(store.sortedCards().length).toBe(3);
    });
  });

  // --- COMPUTED TESTS ---
  describe('Computed Properties', () => {
    beforeEach(async () => {
      // Load initial data to populate the store signals
      await store.loadAllCards();
      await store.loadAllCategories();
      await store.loadAllOrders();
    });

    it('totalCardCount should reflect the total number of cards', () => {
      expect(store.totalCardCount()).toBe(MOCK_CARDS.length);
    });

    it('cardCount should reflect the count of sorted (filtered) cards', () => {
      // No filter initially
      expect(store.cardCount()).toBe(MOCK_CARDS.length);

      store.selectCategory(2);
      // Only 1 card (Card B) in category 2
      expect(store.cardCount()).toBe(1);
    });

    it('sortedCards should sort by title when no category is selected', () => {
      // MOCK_CARDS are already sorted A, B, C, but this verifies the computed logic
      store.selectCategory(null);
      expect(store.sortedCards()[0].title).toBe('Card A');
    });

    it('selectedCategoryName should return category name or "All"', () => {
      expect(store.selectedCategoryName()).toBe('All'); // Null categoryId

      store.selectCategory(1);
      expect(store.selectedCategoryName()).toBe('Books'); // Category 1 name

      store.selectCategory(99); // Non-existent ID
      expect(store.selectedCategoryName()).toBe('Unknown');
    });

    it('sortedOrders should sort orders by description', () => {
      // MOCK_ORDERS are already sorted A, B, but this verifies the computed logic
      expect(store.sortedOrders()[0].description).toBe('Order A');
      expect(store.sortedOrders()[1].description).toBe('Order B');
    });
  });

  // --- CRUD METHOD TESTS ---
  describe('CRUD Methods', () => {
    const newCardData: Omit<Card, 'id'> = {
      title: 'New',
      description: 'New',
      price: 5,
      image: 'd.png',
      catagoryId: 1,
      quantity: 1,
    };
    const addedCard: Card = { id: 200, ...newCardData };
    const updatedCard: Card = { ...MOCK_CARDS[0], title: 'Updated Title' };

    beforeEach(async () => {
      // Ensure initial load
      await store.loadAllCards();
      mockCardsService.getCards.calls.reset(); // Reset call count after initial load
    });

    it('updateCard should call service, reload cards, and update state on success', async () => {
      // Setup mock reload to return the updated list
      const reloadedCards = [updatedCard, MOCK_CARDS[1], MOCK_CARDS[2]];
      mockCardsService.getCards.and.resolveTo(reloadedCards);

      await store.updateCard(updatedCard);

      expect(mockCardsService.updateCard).toHaveBeenCalledWith(updatedCard);
      expect(mockCardsService.getCards).toHaveBeenCalledTimes(1);
      expect(store.cards()).toEqual(reloadedCards);
      expect(store.loadingCards()).toBeFalse();
      expect(mockLoggerService.trace).toHaveBeenCalledWith(
        'DataStore',
        jasmine.stringContaining('Card updated successfully'),
      );
    });

    it('updateCard should handle service failure and throw error', async () => {
      mockCardsService.updateCard.and.rejectWith('Update Failed');

      await expectAsync(store.updateCard(updatedCard)).toBeRejectedWith(
        'Update Failed',
      );

      expect(store.loadingCards()).toBeFalse();
      expect(mockCardsService.getCards).not.toHaveBeenCalled();
      expect(mockLoggerService.error).toHaveBeenCalledWith(
        'DataStore',
        jasmine.stringContaining('Failed to update card: Update Failed'),
      );
    });

    it('addCard should call service, reload cards, update state, and return the added card', async () => {
      mockCardsService.addCard.and.resolveTo(addedCard);
      const reloadedCards = [...MOCK_CARDS, addedCard];
      mockCardsService.getCards.and.resolveTo(reloadedCards);

      const result = await store.addCard(newCardData);

      expect(result).toEqual(addedCard);
      expect(mockCardsService.addCard).toHaveBeenCalledWith(newCardData);
      expect(mockCardsService.getCards).toHaveBeenCalledTimes(1);
      expect(store.cards()).toEqual(reloadedCards);
    });

    it('deleteCard should call service, reload cards, and update state', async () => {
      const cardIdToDelete = MOCK_CARDS[0].id;
      const reloadedCards = MOCK_CARDS.slice(1);
      mockCardsService.getCards.and.resolveTo(reloadedCards);

      await store.deleteCard(cardIdToDelete);

      expect(mockCardsService.deleteCard).toHaveBeenCalledWith(cardIdToDelete);
      expect(mockCardsService.getCards).toHaveBeenCalledTimes(1);
      expect(store.cards()).toEqual(reloadedCards);
    });

    it('searchCards should call service and patch state with results', async () => {
      const searchResults: Card[] = [MOCK_CARDS[0]];
      mockCardsService.searchCards.and.resolveTo(searchResults);

      await store.searchCards('Card A');

      expect(mockCardsService.searchCards).toHaveBeenCalledWith('Card A');
      expect(store.cards()).toEqual(searchResults);
      expect(store.loadingCards()).toBeFalse();
      expect(mockLoggerService.trace).toHaveBeenCalledWith(
        'DataStore',
        jasmine.stringContaining('Search returned 1 cards'),
      );
    });
  });

  // --- ORDER MANAGEMENT TESTS ---
  describe('Order Management', () => {
    const cardToAdd = MOCK_CARDS[0];
    const newOrders = MOCK_ORDERS.concat([
      {
        id: 3,
        customerid: 1,
        artikelid: cardToAdd.id,
        description: 'New',
        quantity: 1,
        categoryid: 1,
        price: 15.0,
      },
    ]);

    it('addToShoppingCard should call orderService and update state', async () => {
      // Mock the service to return a signal containing the new orders
      mockOrdersService.addCardToOrder.and.resolveTo(signal(newOrders));

      await store.addToShoppingCard(cardToAdd);

      expect(mockOrdersService.addCardToOrder).toHaveBeenCalledWith(
        1,
        cardToAdd,
      );
      expect(store.orders()).toEqual(newOrders);
      expect(mockLoggerService.debug).toHaveBeenCalledWith(
        'DataStore',
        jasmine.stringContaining(`Added Card A to shopping cart`),
      );
    });

    it('removeCardFromOrder should call orderService, reload orders, and update state', async () => {
      // Mock reload to return reduced orders
      mockOrdersService.getOrders.and.resolveTo(MOCK_ORDERS.slice(1));

      await store.removeCardFromOrder(MOCK_CARDS[0]);

      expect(mockOrdersService.removeCardFromOrder).toHaveBeenCalledWith(
        1,
        MOCK_CARDS[0],
      );
      expect(mockOrdersService.getOrders).toHaveBeenCalled();
      expect(store.orders()).toEqual(MOCK_ORDERS.slice(1));
    });

    it('clearOrders should empty the orders array in state', async () => {
      // Load initial orders first - AWAIT the promise
      await store.loadAllOrders();
      expect(store.orders().length).toBeGreaterThan(0);

      store.clearOrders();

      expect(store.orders()).toEqual([]);
      expect(mockLoggerService.info).toHaveBeenCalledWith(
        'DataStore',
        'All orders cleared',
      );
    });
  });
});
