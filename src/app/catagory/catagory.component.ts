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
    this.dataStore.selectCategory(categoryId);
    const categoryName =
      categoryId === null
        ? 'All'
        : (this.dataStore.categories().find((c) => c.id === categoryId)?.name ??
          'Unknown');
    this.loggerService.info(
      'CatagoryComponent',
      `Selected category: ${categoryName}`,
    );

    this.loggerService.info(
      'CatagoryComponent',
      `cards: ${JSON.stringify(this.dataStore.cards())}`,
    );
  }

  isSelected(categoryId: number | null): boolean {
    return this.dataStore.selectedCategoryId() === categoryId;
  }
}
