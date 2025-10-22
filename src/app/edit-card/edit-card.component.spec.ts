import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditCardComponent } from './edit-card.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('EditCardComponent', () => {
  let component: EditCardComponent;
  let fixture: ComponentFixture<EditCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditCardComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(EditCardComponent);
    component = fixture.componentInstance;

    // Set required inputs BEFORE detectChanges
    fixture.componentRef.setInput('categories', []);
    fixture.componentRef.setInput('card', null);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
