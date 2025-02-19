import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VehicleChoicePage } from './vehicle-choice.page';

describe('VehicleChoicePage', () => {
  let component: VehicleChoicePage;
  let fixture: ComponentFixture<VehicleChoicePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(VehicleChoicePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
