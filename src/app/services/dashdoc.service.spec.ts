import { TestBed } from '@angular/core/testing';

import { DashdocService } from './dashdoc.service';

describe('DashdocService', () => {
  let service: DashdocService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DashdocService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
