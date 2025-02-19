import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TransportsPage } from './transports.page';

describe('DeliveriesPage', () => {
  let component: TransportsPage;
  let fixture: ComponentFixture<TransportsPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(TransportsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
