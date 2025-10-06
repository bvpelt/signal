import { Component, OnInit, inject } from '@angular/core';
import { DataStore } from '../store/data.store';
import { CatagoryService } from '../services/catagory.service';
import { LoggerService } from '../services/logger.service';

@Component({
  selector: 'app-catagory',
  imports: [],
  templateUrl: './catagory.component.html',
  styleUrl: './catagory.component.scss',
})
export class CatagoryComponent implements OnInit {
  dataStore = inject(DataStore);

  constructor(
    private categoryService: CatagoryService,
    private loggerService: LoggerService,
  ) {}

  ngOnInit() {
    this.dataStore.loadAllCategories();
    this.loggerService.info(
      'CatagoryComponent',
      'Category component initialized',
    );
  }
}
