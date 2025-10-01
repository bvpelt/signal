import { Injectable } from '@angular/core';
import { CARDS } from '../data/mock-data';

@Injectable({
  providedIn: 'root'
})
export class CardsService {

  constructor() { }

  async getCards() {
    return CARDS;
  }
}
