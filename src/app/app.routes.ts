import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ShomeComponent } from './shome/shome.component';
import { ShopComponent } from './shop/shop.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'signal', component: ShomeComponent },
  { path: 'shop', component: ShopComponent },
];
