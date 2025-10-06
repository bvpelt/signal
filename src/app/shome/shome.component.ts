import { Component, signal, computed, effect } from '@angular/core';

@Component({
  selector: 'app-shome',
  imports: [],
  templateUrl: './shome.component.html',
  styleUrl: './shome.component.scss',
})
export class ShomeComponent {
  scounter = signal(0);
  colors = signal(['red', 'green', 'blue', 'yellow', 'purple', 'orange']);
  length = signal(20);
  breadth = signal(40);
  area = computed(() => this.length() * this.breadth()); // compouted signal, derived from length and breadth

  constructor() {
    effect(() => {
      // console.log('Effect due to counter change:', this.scounter());
    });
    effect(() => {
      // console.log('Effect due to colors change:', this.colors());
    });
  }

  sincrement() {
    //    this.scounter.set(this.scounter() + 1);
    this.scounter.update((n) => n + 1);
  }

  sdecrement() {
    //    this.scounter.set(this.scounter() - 1);
    this.scounter.update((n) => n - 1);
  }

  sinccolor() {
    // Example: add a color to the array
    this.colors.update((values) => [...values, 'pink']);
  }

  sdeccolor() {
    // Example: remove 'pink' from the array
    this.colors.update((values) => values.filter((value) => value !== 'pink'));
  }

  sinclenght() {
    this.length.update((n) => n + 1);
  }

  sdeclenght() {
    this.length.update((n) => n - 1);
  }
  sincbreadth() {
    this.breadth.update((n) => n + 1);
  }

  sdecbreadth() {
    this.breadth.update((n) => n - 1);
  }
}
