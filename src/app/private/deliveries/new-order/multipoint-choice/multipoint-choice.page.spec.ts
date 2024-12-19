import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MultipointChoicePage } from './multipoint-choice.page';

describe('MultipointChoicePage', () => {
  let component: MultipointChoicePage;
  let fixture: ComponentFixture<MultipointChoicePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(MultipointChoicePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
