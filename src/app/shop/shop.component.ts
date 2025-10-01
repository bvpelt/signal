import { Component, OnInit } from '@angular/core';
import { card } from '../data/mock-data';
import { CardsService } from '../services/cards.service';


@Component({
  selector: 'app-shop',
  imports: [],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss'
})
export class ShopComponent implements OnInit {

  cards: card[] = [];

  constructor(cardsService: CardsService) {
    cardsService.getCards().then(cards => this.cards = cards);
  }

  ngOnInit() {
    console.log(this.cards);
  }
}
