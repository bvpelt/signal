import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShopComponent } from './shop.component';
import { DataStore } from '../store/data.store';
import { signal } from '@angular/core';

describe('ShopComponent', () => {
  let component: ShopComponent;
  let fixture: ComponentFixture<ShopComponent>;
  let mockDataStore: any;

  beforeEach(async () => {
    // Create a mock DataStore with all necessary signals and methods
    mockDataStore = {
      categories: signal([]),
      cards: signal([]),
      orders: signal([]),
      sortedCards: signal([]),
      sortedOrders: signal([]),
      selectedCategoryId: signal(null),
      selectedCategoryName: signal('All'),
      cardCount: signal(0),
      totalCardCount: signal(0),
      categoryCount: signal(0),
      orderCount: signal(0),
      loadingCategories: signal(false),
      loadingCards: signal(false),
      loadingOrders: signal(false),
      loadAllCategories: jasmine.createSpy('loadAllCategories').and.resolveTo(),
      loadAllCards: jasmine.createSpy('loadAllCards').and.resolveTo(),
      loadAllOrders: jasmine.createSpy('loadAllOrders').and.resolveTo(),
      selectCategory: jasmine.createSpy('selectCategory'),
      clearCategoryFilter: jasmine.createSpy('clearCategoryFilter'),
      updateCard: jasmine.createSpy('updateCard').and.resolveTo(),
      addCard: jasmine.createSpy('addCard').and.resolveTo({ id: 1 }),
      deleteCard: jasmine.createSpy('deleteCard').and.resolveTo(),
      searchCards: jasmine.createSpy('searchCards').and.resolveTo(),
      addToShoppingCard: jasmine.createSpy('addToShoppingCard').and.resolveTo(),
      removeCardFromOrder: jasmine
        .createSpy('removeCardFromOrder')
        .and.resolveTo(),
      clearOrders: jasmine.createSpy('clearOrders'),
      resetStore: jasmine.createSpy('resetStore'),
    };

    await TestBed.configureTestingModule({
      imports: [ShopComponent],
      providers: [{ provide: DataStore, useValue: mockDataStore }],
    }).compileComponents();

    fixture = TestBed.createComponent(ShopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ... rest of your tests
});
