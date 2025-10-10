import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ShomeComponent } from './shome/shome.component';
import { ShopComponent } from './shop/shop.component';
import { LoggerComponent } from './logger/logger.component';
import { OrdercardComponent } from './ordercard/ordercard.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'signal', component: ShomeComponent },
  { path: 'shop', component: ShopComponent },
  { path: 'orders', component: OrdercardComponent },
  { path: 'log', component: LoggerComponent },
];
