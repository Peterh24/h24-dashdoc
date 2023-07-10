import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetailDeliveryPage } from './detail-delivery.page';

describe('DetailDeliveryPage', () => {
  let component: DetailDeliveryPage;
  let fixture: ComponentFixture<DetailDeliveryPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(DetailDeliveryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
