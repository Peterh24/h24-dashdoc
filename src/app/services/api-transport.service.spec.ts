import { TestBed } from '@angular/core/testing';

import { ApiTransportService } from './api-transport.service';

describe('ApiTransportService', () => {
  let service: ApiTransportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiTransportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
