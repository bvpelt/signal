import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { DataStore } from '../store/data.store';
import { LoggerService } from '../services/logger.service';

@Component({
  selector: 'app-catagory',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './catagory.component.html',
  styleUrl: './catagory.component.scss',
})
export class CatagoryComponent implements OnInit {
  dataStore = inject(DataStore);
  loggerService = inject(LoggerService);

  ngOnInit(): void {
    this.dataStore.loadAllCategories();
    this.loggerService.info(
      'CatagoryComponent',
      'Category component initialized',
    );
  }

  selectCategory(categoryId: number | null): void {
    const categoryName =
      categoryId === null
        ? 'All'
        : (this.dataStore.categories().find((c) => c.id === categoryId)?.name ??
          'Unknown');

    this.loggerService.info(
      'CatagoryComponent',
      `User selected category: ${categoryName} (ID: ${categoryId})`,
    );

    // Log current cards state before selecting
    const totalCards = this.dataStore.cards().length;
    this.loggerService.debug(
      'CatagoryComponent',
      `Total cards in store: ${totalCards}`,
    );

    if (categoryId !== null) {
      const cardsInCategory = this.dataStore
        .cards()
        .filter((c) => c.catagoryId === categoryId).length;
      this.loggerService.debug(
        'CatagoryComponent',
        `Cards in category ${categoryId}: ${cardsInCategory}`,
      );
    }

    this.dataStore.selectCategory(categoryId);
  }

  isSelected(categoryId: number | null): boolean {
    return this.dataStore.selectedCategoryId() === categoryId;
  }
}
