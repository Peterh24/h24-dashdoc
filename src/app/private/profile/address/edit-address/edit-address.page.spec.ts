import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditAddressPage } from './edit-address.page';

describe('EditAddressPage', () => {
  let component: EditAddressPage;
  let fixture: ComponentFixture<EditAddressPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(EditAddressPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
