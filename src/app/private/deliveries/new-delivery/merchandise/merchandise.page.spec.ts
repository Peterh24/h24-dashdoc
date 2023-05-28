import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MerchandisePage } from './merchandise.page';

describe('MerchandisePage', () => {
  let component: MerchandisePage;
  let fixture: ComponentFixture<MerchandisePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(MerchandisePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
