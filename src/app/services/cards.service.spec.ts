import { TestBed } from '@angular/core/testing';
import { CardsService } from './cards.service';
import { LoggerService } from './logger.service';
import { Card } from '../data/card';
import { CARDS } from '../data/mock-data';

describe('CardsService', () => {
  let service: CardsService;
  let loggerService: jasmine.SpyObj<LoggerService>;

  beforeEach(() => {
    // Create a spy object for LoggerService
    const loggerSpy = jasmine.createSpyObj('LoggerService', [
      'debug',
      'info',
      'warning',
      'error',
      'trace',
    ]);

    TestBed.configureTestingModule({
      providers: [
        CardsService,
        { provide: LoggerService, useValue: loggerSpy },
      ],
    });

    service = TestBed.inject(CardsService);
    loggerService = TestBed.inject(
      LoggerService,
    ) as jasmine.SpyObj<LoggerService>;
  });

  afterEach(() => {
    // Reset the service state by creating a new instance
    service = new CardsService(loggerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCards', () => {
    it('should return all cards', async () => {
      const cards = await service.getCards();

      expect(cards).toBeDefined();
      expect(cards.length).toBeGreaterThan(0);
      expect(loggerService.debug).toHaveBeenCalledWith(
        'CardsService',
        jasmine.stringContaining('Retrieved'),
      );
    });

    it('should return a copy of the cards array', async () => {
      const cards1 = await service.getCards();
      const cards2 = await service.getCards();

      expect(cards1).not.toBe(cards2); // Different array references
      expect(cards1).toEqual(cards2); // Same content
    });

    it('should return cards matching the mock data structure', async () => {
      const cards = await service.getCards();

      expect(cards.length).toBeGreaterThan(0);
      expect(cards[0]).toEqual(
        jasmine.objectContaining({
          id: jasmine.any(Number),
          title: jasmine.any(String),
          catagoryId: jasmine.any(Number),
          image: jasmine.any(String),
          description: jasmine.any(String),
          price: jasmine.any(Number),
          quantity: jasmine.any(Number),
        }),
      );
    });

    it('should delay execution by at least 100ms', async () => {
      const startTime = Date.now();
      await service.getCards();
      const endTime = Date.now();

      expect(endTime - startTime).toBeGreaterThanOrEqual(100);
    });
  });

  describe('updateCard', () => {
    it('should update an existing card', async () => {
      const cards = await service.getCards();
      const cardToUpdate = cards[0];
      const updatedData: Card = {
        ...cardToUpdate,
        title: 'Updated Title',
        price: 99.99,
      };

      await service.updateCard(updatedData);
      const updatedCards = await service.getCards();
      const updatedCard = updatedCards.find((c) => c.id === cardToUpdate.id);

      expect(updatedCard).toBeDefined();
      expect(updatedCard?.title).toBe('Updated Title');
      expect(updatedCard?.price).toBe(99.99);
    });

    it('should update card category', async () => {
      const cards = await service.getCards();
      const cardToUpdate = cards[0];
      const originalCategory = cardToUpdate.catagoryId;
      const newCategory = originalCategory === 1 ? 2 : 1;

      const updatedData: Card = {
        ...cardToUpdate,
        catagoryId: newCategory,
      };

      await service.updateCard(updatedData);
      const updatedCards = await service.getCards();
      const updatedCard = updatedCards.find((c) => c.id === cardToUpdate.id);

      expect(updatedCard?.catagoryId).toBe(newCategory);
      expect(updatedCard?.catagoryId).not.toBe(originalCategory);
    });

    it('should log the update', async () => {
      const cards = await service.getCards();
      const cardToUpdate = cards[0];

      await service.updateCard(cardToUpdate);

      expect(loggerService.info).toHaveBeenCalledWith(
        'CardsService',
        jasmine.stringContaining('Updated card'),
      );
      expect(loggerService.debug).toHaveBeenCalledWith(
        'CardsService',
        jasmine.stringContaining('Verified in service'),
      );
    });

    it('should not affect other cards when updating one card', async () => {
      const cards = await service.getCards();
      const cardToUpdate = cards[0];
      const otherCard = cards[1];
      const originalOtherCard = { ...otherCard };

      await service.updateCard({
        ...cardToUpdate,
        title: 'Updated Title',
      });

      const updatedCards = await service.getCards();
      const unchangedCard = updatedCards.find((c) => c.id === otherCard.id);

      expect(unchangedCard).toEqual(originalOtherCard);
    });

    it('should handle updating non-existent card gracefully', async () => {
      const nonExistentCard: Card = {
        id: 99999,
        title: 'Non-existent',
        description: 'Test',
        price: 1.0,
        image: 'test.png',
        catagoryId: 1,
        quantity: 0,
      };

      await service.updateCard(nonExistentCard);
      const cards = await service.getCards();
      const foundCard = cards.find((c) => c.id === 99999);

      expect(foundCard).toBeUndefined();
    });
  });

  describe('addCard', () => {
    it('should add a new card', async () => {
      const initialCards = await service.getCards();
      const initialCount = initialCards.length;

      const newCard: Omit<Card, 'id'> = {
        title: 'New Product',
        description: 'Test product',
        price: 5.99,
        image: 'new.png',
        catagoryId: 1,
        quantity: 0,
      };

      const addedCard = await service.addCard(newCard);
      const updatedCards = await service.getCards();

      expect(updatedCards.length).toBe(initialCount + 1);
      expect(addedCard.id).toBeDefined();
      expect(addedCard.title).toBe('New Product');
    });

    it('should generate unique IDs for new cards', async () => {
      const newCard1: Omit<Card, 'id'> = {
        title: 'Product 1',
        description: 'Test 1',
        price: 1.0,
        image: 'test1.png',
        catagoryId: 1,
        quantity: 0,
      };

      const newCard2: Omit<Card, 'id'> = {
        title: 'Product 2',
        description: 'Test 2',
        price: 2.0,
        image: 'test2.png',
        catagoryId: 1,
        quantity: 0,
      };

      const added1 = await service.addCard(newCard1);
      const added2 = await service.addCard(newCard2);

      expect(added1.id).not.toBe(added2.id);
      expect(added2.id).toBeGreaterThan(added1.id);
    });

    it('should log the addition', async () => {
      const newCard: Omit<Card, 'id'> = {
        title: 'New Product',
        description: 'Test',
        price: 1.0,
        image: 'test.png',
        catagoryId: 1,
        quantity: 0,
      };

      await service.addCard(newCard);

      expect(loggerService.info).toHaveBeenCalledWith(
        'CardsService',
        jasmine.stringContaining('Added new card'),
      );
    });

    it('should preserve all properties of the new card', async () => {
      const newCard: Omit<Card, 'id'> = {
        title: 'Test Product',
        description: 'Test Description',
        price: 12.34,
        image: 'test-image.png',
        catagoryId: 2,
        quantity: 5,
      };

      const addedCard = await service.addCard(newCard);

      expect(addedCard.title).toBe(newCard.title);
      expect(addedCard.description).toBe(newCard.description);
      expect(addedCard.price).toBe(newCard.price);
      expect(addedCard.image).toBe(newCard.image);
      expect(addedCard.catagoryId).toBe(newCard.catagoryId);
      expect(addedCard.quantity).toBe(newCard.quantity);
    });

    it('should add multiple cards sequentially', async () => {
      const initialCards = await service.getCards();
      const initialCount = initialCards.length;

      const card1: Omit<Card, 'id'> = {
        title: 'Card 1',
        description: 'Test 1',
        price: 1.0,
        image: 'test1.png',
        catagoryId: 1,
        quantity: 0,
      };

      const card2: Omit<Card, 'id'> = {
        title: 'Card 2',
        description: 'Test 2',
        price: 2.0,
        image: 'test2.png',
        catagoryId: 1,
        quantity: 0,
      };

      const card3: Omit<Card, 'id'> = {
        title: 'Card 3',
        description: 'Test 3',
        price: 3.0,
        image: 'test3.png',
        catagoryId: 1,
        quantity: 0,
      };

      await service.addCard(card1);
      await service.addCard(card2);
      await service.addCard(card3);

      const finalCards = await service.getCards();
      expect(finalCards.length).toBe(initialCount + 3);
    });
  });

  describe('deleteCard', () => {
    it('should delete an existing card', async () => {
      const cards = await service.getCards();
      const initialCount = cards.length;
      const cardToDelete = cards[0];

      await service.deleteCard(cardToDelete.id);
      const updatedCards = await service.getCards();

      expect(updatedCards.length).toBe(initialCount - 1);
      expect(
        updatedCards.find((c) => c.id === cardToDelete.id),
      ).toBeUndefined();
    });

    it('should log the deletion', async () => {
      const cards = await service.getCards();
      const cardToDelete = cards[0];

      await service.deleteCard(cardToDelete.id);

      expect(loggerService.info).toHaveBeenCalledWith(
        'CardsService',
        jasmine.stringContaining('Deleted card'),
      );
    });

    it('should handle deleting non-existent card gracefully', async () => {
      const cards = await service.getCards();
      const initialCount = cards.length;

      await service.deleteCard(99999);
      const updatedCards = await service.getCards();

      expect(updatedCards.length).toBe(initialCount);
    });

    it('should not affect other cards when deleting one', async () => {
      const cards = await service.getCards();
      const cardToDelete = cards[0];
      const cardToKeep = cards[1];

      await service.deleteCard(cardToDelete.id);
      const updatedCards = await service.getCards();

      expect(updatedCards.find((c) => c.id === cardToKeep.id)).toBeDefined();
    });

    it('should delete multiple cards sequentially', async () => {
      const cards = await service.getCards();
      const initialCount = cards.length;

      await service.deleteCard(cards[0].id);
      await service.deleteCard(cards[1].id);

      const updatedCards = await service.getCards();
      expect(updatedCards.length).toBe(initialCount - 2);
    });
  });

  describe('searchCards', () => {
    it('should find cards by title', async () => {
      const cards = await service.getCards();
      const searchCard = cards[0];
      const searchTerm = searchCard.title.substring(0, 3);

      const results = await service.searchCards(searchTerm);

      expect(results.length).toBeGreaterThan(0);
      expect(results.some((c) => c.id === searchCard.id)).toBe(true);
    });

    it('should find cards by description', async () => {
      const cards = await service.getCards();
      const searchCard = cards.find((c) => c.description.length > 3);
      if (!searchCard) {
        pending('No card with description found');
        return;
      }

      const searchTerm = searchCard.description.substring(0, 3);
      const results = await service.searchCards(searchTerm);

      expect(results.some((c) => c.id === searchCard.id)).toBe(true);
    });

    it('should be case-insensitive', async () => {
      const cards = await service.getCards();
      const searchCard = cards[0];
      const searchTermLower = searchCard.title.toLowerCase();
      const searchTermUpper = searchCard.title.toUpperCase();

      const resultsLower = await service.searchCards(searchTermLower);
      const resultsUpper = await service.searchCards(searchTermUpper);

      expect(resultsLower.length).toBe(resultsUpper.length);
      expect(resultsLower.some((c) => c.id === searchCard.id)).toBe(true);
      expect(resultsUpper.some((c) => c.id === searchCard.id)).toBe(true);
    });

    it('should return empty array when no matches found', async () => {
      const results = await service.searchCards('NonExistentProduct12345');

      expect(results).toEqual([]);
    });

    it('should return all matching cards', async () => {
      const results = await service.searchCards('a');

      expect(results.length).toBeGreaterThan(0);
      results.forEach((card) => {
        const matchesTitle = card.title.toLowerCase().includes('a');
        const matchesDescription = card.description.toLowerCase().includes('a');
        expect(matchesTitle || matchesDescription).toBe(true);
      });
    });

    it('should log the search', async () => {
      await service.searchCards('test');

      expect(loggerService.debug).toHaveBeenCalledWith(
        'CardsService',
        jasmine.stringContaining('Searching for cards with term:'),
      );
    });

    it('should return a copy of results, not original cards', async () => {
      const cards = await service.getCards();
      const results = await service.searchCards(cards[0].title);

      expect(results[0]).not.toBe(cards[0]); // Different reference
      expect(results[0]).toEqual(cards[0]); // Same content
    });
  });

  describe('Integration Tests', () => {
    it('should handle full CRUD cycle', async () => {
      // Create
      const newCard: Omit<Card, 'id'> = {
        title: 'Integration Test Product',
        description: 'Test Description',
        price: 15.99,
        image: 'test.png',
        catagoryId: 1,
        quantity: 0,
      };

      const added = await service.addCard(newCard);
      expect(added.id).toBeDefined();

      // Read
      const cards = await service.getCards();
      expect(cards.find((c) => c.id === added.id)).toBeDefined();

      // Update
      const updated: Card = { ...added, title: 'Updated Title', price: 20.99 };
      await service.updateCard(updated);
      const cardsAfterUpdate = await service.getCards();
      const updatedCard = cardsAfterUpdate.find((c) => c.id === added.id);
      expect(updatedCard?.title).toBe('Updated Title');
      expect(updatedCard?.price).toBe(20.99);

      // Delete
      await service.deleteCard(added.id);
      const cardsAfterDelete = await service.getCards();
      expect(cardsAfterDelete.find((c) => c.id === added.id)).toBeUndefined();
    });

    it('should search newly added cards', async () => {
      const uniqueTitle = 'UniqueTestProduct' + Date.now();
      const newCard: Omit<Card, 'id'> = {
        title: uniqueTitle,
        description: 'Test',
        price: 1.0,
        image: 'test.png',
        catagoryId: 1,
        quantity: 0,
      };

      await service.addCard(newCard);
      const results = await service.searchCards(uniqueTitle);

      expect(results.length).toBe(1);
      expect(results[0].title).toBe(uniqueTitle);
    });

    it('should not find deleted cards in search', async () => {
      const cards = await service.getCards();
      const cardToDelete = cards[0];
      const searchTerm = cardToDelete.title;

      await service.deleteCard(cardToDelete.id);
      const results = await service.searchCards(searchTerm);

      expect(results.find((c) => c.id === cardToDelete.id)).toBeUndefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty search term', async () => {
      const results = await service.searchCards('');

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle special characters in search', async () => {
      const results = await service.searchCards('!@#$%^&*()');

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle updating with same data', async () => {
      const cards = await service.getCards();
      const card = cards[0];

      await service.updateCard(card);
      const updatedCards = await service.getCards();
      const updatedCard = updatedCards.find((c) => c.id === card.id);

      expect(updatedCard).toEqual(card);
    });

    it('should handle zero and negative prices', async () => {
      const newCard: Omit<Card, 'id'> = {
        title: 'Free Product',
        description: 'Test',
        price: 0,
        image: 'test.png',
        catagoryId: 1,
        quantity: 0,
      };

      const added = await service.addCard(newCard);
      expect(added.price).toBe(0);
    });
  });
});
