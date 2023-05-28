import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PickUpPage } from './pick-up.page';

describe('PickUpPage', () => {
  let component: PickUpPage;
  let fixture: ComponentFixture<PickUpPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(PickUpPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
