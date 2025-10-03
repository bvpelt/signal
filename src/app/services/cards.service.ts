import { Injectable, signal } from '@angular/core';
import { CARDS } from '../data/mock-data';
import { Card } from '../data/card';

@Injectable({
  providedIn: 'root',
})
export class CardsService {
  private cards = signal<Card[]>([]);
  private nextCardId = signal(1);

  // Readonly signal voor externe toegang
  readonly allCards = this.cards.asReadonly();

  constructor() {
    this.cards.set(CARDS);
  }

  async getCards(): Promise<Card[]> {
    return this.allCards();
  }
}
