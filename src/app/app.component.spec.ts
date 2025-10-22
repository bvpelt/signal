import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { AppComponent } from './app.component';
import { provideRouter } from '@angular/router'; // Import provideRouter
import { RouterTestingHarness } from '@angular/router/testing'; // Optional but helpful

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // 1. Declare the standalone component
      imports: [AppComponent],

      // 2. Provide the router services for testing
      providers: [
        // Provide minimal mock routes to satisfy the router directives
        provideRouter([
          { path: '', component: MockRouteComponent },
          { path: 'signal', component: MockRouteComponent },
          { path: 'shop', component: MockRouteComponent },
          { path: 'orders', component: MockRouteComponent },
          { path: 'log', component: MockRouteComponent },
        ]),
      ],
    }).compileComponents();
  });

  // A simple mock component for the router to point to
  @Component({ template: '' })
  class MockRouteComponent {}

  // --- The 'should create the app' fix:
  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  // --- The 'should have the 'signal' title' fix:
  it(`should have the 'signal' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('signal');
  });

  // --- The 'should render title' fix:
  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    // You need to detect changes to render the DOM from the component's state
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    // Check if the title is rendered. Since you don't render 'title' in the template,
    // we'll check for a common element like the nav links.
    // NOTE: The original test for 'should render title' is often looking for a <h1>
    // containing {{ title }}. If you don't have that, this test needs to be updated
    // to check for something that actually *is* in the template (e.g., the nav links).

    expect(compiled.querySelector('nav a:nth-child(2)')?.textContent).toContain(
      'Signal Home',
    );
  });
});
