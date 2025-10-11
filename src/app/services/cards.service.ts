import { Injectable, signal } from '@angular/core';
import { Card } from '../data/card';
import { CARDS } from '../data/mock-data';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root',
})
export class CardsService {
  private cards = signal<Card[]>([...CARDS]);

  constructor(private loggerService: LoggerService) {
    this.loggerService.debug('CardsService', 'CardsService initialized');
  }

  // Get all cards
  async getCards(): Promise<Card[]> {
    await this.delay(100);
    this.loggerService.debug(
      'CardsService',
      `Retrieved ${this.cards().length} cards`,
    );
    return [...this.cards()];
  }

  // Update an existing card
  async updateCard(updatedCard: Card): Promise<void> {
    await this.delay(100);

    this.cards.update((cards) =>
      cards.map((card) =>
        card.id === updatedCard.id ? { ...updatedCard } : card,
      ),
    );

    this.loggerService.info(
      'CardsService',
      `Updated card: ${updatedCard.title} (ID: ${updatedCard.id}, Category: ${updatedCard.catagoryId})`,
    );
  }

  // Add a new card
  async addCard(newCard: Omit<Card, 'id'>): Promise<Card> {
    await this.delay(100);

    const maxId = Math.max(...this.cards().map((c) => c.id), 0);
    const card: Card = { ...newCard, id: maxId + 1 };

    this.cards.update((cards) => [...cards, card]);
    this.loggerService.info(
      'CardsService',
      `Added new card: ${card.title} (ID: ${card.id})`,
    );

    return card;
  }

  // Delete a card
  async deleteCard(cardId: number): Promise<void> {
    await this.delay(100);

    const cardToDelete = this.cards().find((c) => c.id === cardId);
    const cardName = cardToDelete?.title ?? 'Unknown';

    this.cards.update((cards) => cards.filter((card) => card.id !== cardId));
    this.loggerService.info(
      'CardsService',
      `Deleted card: ${cardName} (ID: ${cardId})`,
    );
  }

  // Search cards by title
  async searchCards(searchTerm: string): Promise<Card[]> {
    await this.delay(50);
    const term = searchTerm.toLowerCase();
    const results = this.cards().filter(
      (card) =>
        card.title.toLowerCase().includes(term) ||
        card.description.toLowerCase().includes(term),
    );
    this.loggerService.debug(
      'CardsService',
      `Search for "${searchTerm}" returned ${results.length} results`,
    );
    return [...results];
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
