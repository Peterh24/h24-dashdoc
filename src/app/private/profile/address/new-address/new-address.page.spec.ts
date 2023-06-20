import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewAddressPage } from './new-address.page';

describe('NewAddressPage', () => {
  let component: NewAddressPage;
  let fixture: ComponentFixture<NewAddressPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(NewAddressPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
