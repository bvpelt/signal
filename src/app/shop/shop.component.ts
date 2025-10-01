import { Component, OnInit, inject } from '@angular/core';
import { card } from '../data/mock-data';
import { CardsService } from '../services/cards.service';
import { CardStore } from '../store/card.store';

@Component({
  selector: 'app-shop',
  imports: [],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss',
})
export class ShopComponent implements OnInit {
  store = inject(CardStore);
  cards: card[] = [];

  constructor(cardsService: CardsService) {
    
  }

  ngOnInit() {
    this.store.loadAll();
    console.log('ngOnInit: ', this.store.cards());
  }
}
