import { Injectable } from '@angular/core';
import { signal } from '@angular/core';
import { Catagory } from '../data/catagory';
import { CATAGORIES } from '../data/mock-data';

@Injectable({
  providedIn: 'root',
})
export class CatagoryService {
  private categories = signal<Catagory[]>([]);
  private nextCategoryId = signal(1);

  // Readonly signal voor externe toegang
  readonly allCategories = this.categories.asReadonly();

  constructor() {
    this.categories.set(CATAGORIES);
  }

  async getCategories(): Promise<Catagory[]> {
    return this.allCategories();
  }
}
