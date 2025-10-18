import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Card } from '../data/card';
import { Catagory } from '../data/catagory';
import { LoggerService } from '../services/logger.service';

export type CardFormData = {
  title: string;
  description: string;
  price: number;
  image: string;
  catagoryId: number;
};

@Component({
  selector: 'app-edit-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './edit-card.component.html',
  styleUrl: './edit-card.component.scss',
})
export class EditCardComponent {
  private loggerService = inject(LoggerService);

  // Inputs
  card = input<Card | null>(null); // null means adding new card
  categories = input.required<Catagory[]>();
  isNewCard = input<boolean>(false);

  // Outputs
  save = output<CardFormData>();
  cancel = output<void>();

  // Form state
  editForm = signal<CardFormData>({
    title: '',
    description: '',
    price: 0,
    image: '',
    catagoryId: 1,
  });

  // Form title
  formTitle = signal<string>('Edit Product');

  constructor() {
    // Initialize form when card input changes
    effect(() => {
      const card = this.card();
      const categories = this.categories();
      const isNew = this.isNewCard();

      if (isNew) {
        // Adding new card
        this.formTitle.set('Add New Product');
        this.editForm.set({
          title: '',
          description: '',
          price: 0,
          image: '',
          catagoryId: categories[0]?.id ?? 1,
        });
        this.loggerService.debug(
          'EditCardComponent',
          'Initialized form for new card',
        );
      } else if (card) {
        // Editing existing card
        this.formTitle.set('Edit Product');
        this.editForm.set({
          title: card.title,
          description: card.description,
          price: card.price,
          image: card.image,
          catagoryId: card.catagoryId,
        });
        this.loggerService.debug(
          'EditCardComponent',
          `Initialized form for card: ${card.title}`,
        );
      }
    });
  }

  onSave(): void {
    const form = this.editForm();

    // Validate form
    if (!form.title.trim()) {
      this.loggerService.warning('EditCardComponent', 'Title is required');
      return;
    }

    if (form.price < 0) {
      this.loggerService.warning(
        'EditCardComponent',
        'Price cannot be negative',
      );
      return;
    }

    // Emit save event with sanitized data
    const formData: CardFormData = {
      title: form.title.trim(),
      description: form.description.trim(),
      price: form.price,
      image: form.image.trim(),
      catagoryId: Number(form.catagoryId),
    };

    this.loggerService.debug(
      'EditCardComponent',
      `Saving card: ${formData.title} (Category: ${formData.catagoryId})`,
    );

    this.save.emit(formData);
  }

  onCancel(): void {
    this.loggerService.debug('EditCardComponent', 'Cancel clicked');
    this.cancel.emit();
  }

  // Update form field
  updateField(field: keyof CardFormData, value: string | number): void {
    this.editForm.update((form) => ({ ...form, [field]: value }));
  }
}
