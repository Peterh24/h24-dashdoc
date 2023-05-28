import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditDeliveryPage } from './edit-delivery.page';

describe('EditDeliveryPage', () => {
  let component: EditDeliveryPage;
  let fixture: ComponentFixture<EditDeliveryPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(EditDeliveryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
