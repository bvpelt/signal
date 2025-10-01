import { card } from '../data/mock-data';
import { computed, inject } from '@angular/core';
import { patchState, withState, signalStore, withMethods } from '@ngrx/signals';
import { CardsService } from '../services/cards.service';

type CardState = {
  cards: card[];
  loading: boolean;
};

const initialState: CardState = {
  cards: [],
  loading: false,
};

export const CardStore = signalStore(
  { providedIn: 'root' },
  withState(initialState), // state
  withMethods((store, cardService = inject(CardsService)) => ({
    async loadAll() {
      patchState(store, { loading: true }); // partial update of the state
      const cards = await cardService.getCards();
      patchState(store, { cards, loading: false });
    },
  }))
);
