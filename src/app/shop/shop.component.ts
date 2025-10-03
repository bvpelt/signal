import { Component, OnInit, inject } from '@angular/core';
import { Card } from '../data/card';
import { CardsService } from '../services/cards.service';
import { DataStore } from '../store/data.store';

@Component({
  selector: 'app-shop',
  imports: [],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss',
})
export class ShopComponent implements OnInit {
  dataStore = inject(DataStore);
  cards: Card[] = [];

  constructor(cardsService: CardsService) {
    
  }

  ngOnInit() {
    this.dataStore.loadAllCards();
    console.log('ngOnInit: ', this.dataStore.cards());
  }

  addToShoppingCard(card: Card) {
    console.log('ShopComponent addToShoppingCard: ', card);
    this.dataStore.addToShoppingCard(card);
  }

  removeCardFromOrder(card: Card) {
    this.dataStore.removeCardFromOrder(card);
  }
}
